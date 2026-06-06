import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/ui/Loading'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { useActiveTournament } from '@/hooks/useActiveTournament'
import {
  useCreatePlayer,
  useDeletePlayer,
  useRosterByTeam,
  useTournamentTeams,
  useUpdatePlayer,
} from '@/hooks/useAdmin'
import type { Player } from '@/types/database'

type PlayerFormState = {
  id?: string
  api_player_id: string
  name: string
  age: string
  number: string
  position: string
  photo_url: string
}

const EMPTY_FORM: PlayerFormState = {
  api_player_id: '',
  name: '',
  age: '',
  number: '',
  position: '',
  photo_url: '',
}

export default function AdminRosters() {
  const toast = useToast()
  const { activeTournament, activeTournamentId } = useActiveTournament()
  const { data: teams, isLoading: teamsLoading } = useTournamentTeams(activeTournamentId || undefined)

  const [teamId, setTeamId] = useState<string>('')
  const { data: players, isLoading: playersLoading } = useRosterByTeam(teamId || undefined)

  const createPlayer = useCreatePlayer()
  const updatePlayer = useUpdatePlayer()
  const deletePlayer = useDeletePlayer()

  const [formState, setFormState] = useState<PlayerFormState>(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null)

  useEffect(() => {
    if (!teamId && teams && teams.length > 0) {
      setTeamId(teams[0].id)
    }
  }, [teams, teamId])

  const selectedTeam = useMemo(() => {
    return (teams || []).find((team) => team.id === teamId)
  }, [teams, teamId])

  const positionCounts = useMemo(() => {
    const summary: Record<string, number> = {}
    ;(players || []).forEach((player) => {
      const position = player.position || 'Unassigned'
      summary[position] = (summary[position] || 0) + 1
    })
    return summary
  }, [players])

  const openCreate = () => {
    setFormState(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (player: Player) => {
    setFormState({
      id: player.id,
      api_player_id: String(player.api_player_id),
      name: player.name,
      age: player.age !== null ? String(player.age) : '',
      number: player.number !== null ? String(player.number) : '',
      position: player.position || '',
      photo_url: player.photo_url || '',
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!teamId) {
      toast.showToast('Select a team first', 'error')
      return
    }

    if (!formState.api_player_id || !formState.name) {
      toast.showToast('Player ID and name are required', 'error')
      return
    }

    const payload = {
      team_id: teamId,
      api_player_id: Number(formState.api_player_id),
      name: formState.name,
      age: formState.age === '' ? null : Number(formState.age),
      number: formState.number === '' ? null : Number(formState.number),
      position: formState.position || null,
      photo_url: formState.photo_url || null,
    }

    try {
      if (formState.id) {
        await updatePlayer.mutateAsync({ id: formState.id, ...payload })
        toast.showToast('Player updated', 'success')
      } else {
        await createPlayer.mutateAsync(payload)
        toast.showToast('Player created', 'success')
      }
      setFormOpen(false)
      setFormState(EMPTY_FORM)
    } catch (error) {
      console.error('Failed to save player', error)
      toast.showToast('Failed to save player', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !teamId) return

    try {
      await deletePlayer.mutateAsync({ id: deleteTarget.id, teamId })
      toast.showToast('Player deleted', 'success')
      setDeleteTarget(null)
    } catch (error) {
      console.error('Failed to delete player', error)
      toast.showToast('Failed to delete player', 'error')
    }
  }

  if (teamsLoading || playersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-raw-black text-raw-white py-8 border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-4xl uppercase mb-2">ROSTER MANAGEMENT</h1>
              <p className="text-gray-300">{activeTournament?.name || 'World Cup 2026'}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={openCreate} disabled={!teamId}>
                + NEW PLAYER
              </Button>
              <Link to="/admin">
                <Button variant="secondary" size="small">
                  ← DASHBOARD
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block font-headline text-xs uppercase mb-1">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
              >
                <option value="">Select team</option>
                {(teams || []).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-700">
              {selectedTeam ? `${selectedTeam.name} · ${(players || []).length} players` : 'No team selected'}
            </div>
          </div>
        </Card>

        {Object.keys(positionCounts).length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-600">
            <h2 className="font-headline text-lg uppercase mb-3">POSITION BREAKDOWN</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(positionCounts).map(([position, count]) => (
                <span
                  key={position}
                  className="px-3 py-1 border-thin border-blue-500 text-blue-900 text-xs font-semibold"
                >
                  {position}: {count}
                </span>
              ))}
            </div>
          </Card>
        )}

        <Card>
          {!players || players.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No players in this team yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-thick border-gray-900">
                    <th className="text-left py-3 px-3 text-xs uppercase">#</th>
                    <th className="text-left py-3 px-3 text-xs uppercase">Player</th>
                    <th className="text-left py-3 px-3 text-xs uppercase">Position</th>
                    <th className="text-left py-3 px-3 text-xs uppercase">Age</th>
                    <th className="text-right py-3 px-3 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(players || []).map((player) => (
                    <tr key={player.id} className="border-b-thin border-gray-300">
                      <td className="py-3 px-3 text-sm">{player.number ?? '-'}</td>
                      <td className="py-3 px-3 text-sm font-semibold">{player.name}</td>
                      <td className="py-3 px-3 text-sm">{player.position || '-'}</td>
                      <td className="py-3 px-3 text-sm">{player.age ?? '-'}</td>
                      <td className="py-3 px-3">
                        <div className="flex justify-end gap-2">
                          <Button size="small" onClick={() => openEdit(player)}>
                            EDIT
                          </Button>
                          <Button
                            size="small"
                            variant="destructive"
                            onClick={() => setDeleteTarget(player)}
                          >
                            DELETE
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={formState.id ? 'EDIT PLAYER' : 'NEW PLAYER'}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="API Player ID"
            type="number"
            value={formState.api_player_id}
            onChange={(e) => setFormState((prev) => ({ ...prev, api_player_id: e.target.value }))}
          />
          <Input
            label="Name"
            value={formState.name}
            onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Number"
            type="number"
            value={formState.number}
            onChange={(e) => setFormState((prev) => ({ ...prev, number: e.target.value }))}
          />
          <Input
            label="Age"
            type="number"
            value={formState.age}
            onChange={(e) => setFormState((prev) => ({ ...prev, age: e.target.value }))}
          />
          <Input
            label="Position"
            value={formState.position}
            onChange={(e) => setFormState((prev) => ({ ...prev, position: e.target.value }))}
          />
          <Input
            label="Photo URL"
            value={formState.photo_url}
            onChange={(e) => setFormState((prev) => ({ ...prev, photo_url: e.target.value }))}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={createPlayer.isPending || updatePlayer.isPending}>
            {createPlayer.isPending || updatePlayer.isPending ? 'SAVING...' : 'SAVE PLAYER'}
          </Button>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>
            CANCEL
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="DELETE PLAYER?"
      >
        <p className="text-gray-700 mb-6">
          This will remove {deleteTarget?.name} from the roster.
        </p>
        <div className="flex gap-3">
          <Button variant="destructive" onClick={handleDelete} disabled={deletePlayer.isPending}>
            {deletePlayer.isPending ? 'DELETING...' : 'DELETE'}
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            CANCEL
          </Button>
        </div>
      </Modal>
    </div>
  )
}
