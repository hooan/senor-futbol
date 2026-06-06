import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/ui/Loading'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { GROUPS, ROUND_ORDER, ROUNDS } from '@/lib/constants'
import { WORLD_CUP_2026_STRUCTURE } from '@/data/worldCupStructure'
import { useActiveTournament } from '@/hooks/useActiveTournament'
import {
  useAdminFixtures,
  useBulkUpdateTeamGroups,
  useCreateFixture,
  useDeleteFixture,
  useSeedWorldCupFixtures,
  useTournamentTeams,
  useUpdateFixture,
} from '@/hooks/useAdmin'
import type { FixtureWithTeams, Group, MatchStatus, Round } from '@/types/database'

type FixtureFormState = {
  id?: string
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string
  referee: string
  status: MatchStatus
  home_score: string
  away_score: string
  round: Round
  group_name: Group
}

const EMPTY_FORM: FixtureFormState = {
  home_team_id: '',
  away_team_id: '',
  match_date: '',
  venue: '',
  referee: '',
  status: 'NS',
  home_score: '',
  away_score: '',
  round: ROUNDS.GROUP_STAGE,
  group_name: GROUPS[0],
}

function toDateTimeLocal(value: string) {
  const date = new Date(value)
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export default function AdminFixtures() {
  const toast = useToast()
  const { activeTournament, activeTournamentId } = useActiveTournament()
  const { data: fixtures, isLoading: fixturesLoading } = useAdminFixtures(activeTournamentId || undefined)
  const { data: teams, isLoading: teamsLoading } = useTournamentTeams(activeTournamentId || undefined)

  const createFixture = useCreateFixture()
  const updateFixture = useUpdateFixture()
  const deleteFixture = useDeleteFixture()
  const seedWorldCupFixtures = useSeedWorldCupFixtures()
  const bulkUpdateTeamGroups = useBulkUpdateTeamGroups()

  const [roundFilter, setRoundFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [groupDrafts, setGroupDrafts] = useState<Record<string, string>>({})
  const [formState, setFormState] = useState<FixtureFormState>(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FixtureWithTeams | null>(null)

  const isLoading = fixturesLoading || teamsLoading

  useEffect(() => {
    if (!teams) return

    const nextDrafts = teams.reduce<Record<string, string>>((accumulator, team) => {
      accumulator[team.id] = team.group_name || ''
      return accumulator
    }, {})

    setGroupDrafts(nextDrafts)
  }, [teams])

  const filteredFixtures = useMemo(() => {
    const list = fixtures || []
    return list.filter((fixture) => {
      const byRound = roundFilter === 'all' || fixture.round === roundFilter
      const byStatus = statusFilter === 'all' || fixture.status === statusFilter
      return byRound && byStatus
    })
  }, [fixtures, roundFilter, statusFilter])

  const groupedTeamCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    Object.values(groupDrafts).forEach((groupName) => {
      if (!groupName) return
      counts[groupName] = (counts[groupName] || 0) + 1
    })

    return counts
  }, [groupDrafts])

  const openCreate = () => {
    setFormState({
      ...EMPTY_FORM,
      round: ROUNDS.GROUP_STAGE,
      group_name: GROUPS[0],
    })
    setFormOpen(true)
  }

  const openEdit = (fixture: FixtureWithTeams) => {
    const groupName =
      fixture.group_name && GROUPS.includes(fixture.group_name as Group)
        ? (fixture.group_name as Group)
        : GROUPS[0]

    setFormState({
      id: fixture.id,
      home_team_id: fixture.home_team_id,
      away_team_id: fixture.away_team_id,
      match_date: toDateTimeLocal(fixture.match_date),
      venue: fixture.venue || '',
      referee: fixture.referee || '',
      status: fixture.status,
      home_score: fixture.home_score !== null ? String(fixture.home_score) : '',
      away_score: fixture.away_score !== null ? String(fixture.away_score) : '',
      round: fixture.round as Round,
      group_name: groupName,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!activeTournamentId) {
      toast.showToast('No active tournament selected', 'error')
      return
    }

    if (!formState.home_team_id || !formState.away_team_id || !formState.match_date) {
      toast.showToast('Home team, away team, and date are required', 'error')
      return
    }

    if (formState.home_team_id === formState.away_team_id) {
      toast.showToast('Home and away teams must be different', 'error')
      return
    }

    const round = formState.round
    const groupName = round === ROUNDS.GROUP_STAGE ? formState.group_name : null

    const basePayload = {
      tournament_id: activeTournamentId,
      home_team_id: formState.home_team_id,
      away_team_id: formState.away_team_id,
      match_date: new Date(formState.match_date).toISOString(),
      venue: formState.venue || null,
      referee: formState.referee || null,
      status: formState.status,
      home_score: formState.home_score === '' ? null : Number(formState.home_score),
      away_score: formState.away_score === '' ? null : Number(formState.away_score),
      round,
      group_name: groupName,
    }

    try {
      if (formState.id) {
        await updateFixture.mutateAsync({ id: formState.id, ...basePayload })
        toast.showToast('Fixture updated', 'success')
      } else {
        await createFixture.mutateAsync(basePayload)
        toast.showToast('Fixture created', 'success')
      }
      setFormOpen(false)
      setFormState(EMPTY_FORM)
    } catch (error) {
      console.error('Failed to save fixture', error)
      toast.showToast('Failed to save fixture', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteFixture.mutateAsync(deleteTarget.id)
      toast.showToast('Fixture deleted', 'success')
      setDeleteTarget(null)
    } catch (error) {
      console.error('Failed to delete fixture', error)
      toast.showToast('Failed to delete fixture', 'error')
    }
  }

  const handleSeedTemplate = async () => {
    if (!activeTournamentId) {
      toast.showToast('No active tournament selected', 'error')
      return
    }

    try {
      const result = await seedWorldCupFixtures.mutateAsync(activeTournamentId)
      toast.showToast(`World Cup template created: ${result.created} fixtures`, 'success', 5000)
    } catch (error) {
      console.error('Failed to seed World Cup fixture template', error)
      toast.showToast(
        error instanceof Error ? error.message : 'Failed to seed fixture template',
        'error'
      )
    }
  }

  const handleSaveGroups = async () => {
    if (!teams || teams.length === 0) return

    const updates = teams
      .filter((team) => (team.group_name || '') !== (groupDrafts[team.id] || ''))
      .map((team) => ({
        id: team.id,
        group_name: groupDrafts[team.id] || null,
      }))

    if (updates.length === 0) {
      toast.showToast('No group assignment changes to save', 'info')
      return
    }

    try {
      await bulkUpdateTeamGroups.mutateAsync(updates)
      toast.showToast('Team group assignments saved', 'success')
    } catch (error) {
      console.error('Failed to save team group assignments', error)
      toast.showToast('Failed to save team group assignments', 'error')
    }
  }

  if (isLoading) {
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
              <h1 className="font-headline text-4xl uppercase mb-2">FIXTURES MANAGEMENT</h1>
              <p className="text-gray-300">{activeTournament?.name || 'World Cup 2026'}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={openCreate}>+ NEW FIXTURE</Button>
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
        <Card className="mb-6 bg-blue-50 border-blue-600">
          <h2 className="font-headline text-xl uppercase mb-3">WORLD CUP 2026 STRUCTURE</h2>
          <p className="text-sm text-blue-900 mb-2">
            {WORLD_CUP_2026_STRUCTURE.totals.teams} teams · {WORLD_CUP_2026_STRUCTURE.totals.totalMatches} matches
          </p>
          <p className="text-xs text-blue-800">
            Groups {GROUPS[0]}-{GROUPS[GROUPS.length - 1]} and knockout stages from Round of 32 to Final.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Button
              size="small"
              onClick={handleSeedTemplate}
              disabled={seedWorldCupFixtures.isPending || (fixtures?.length || 0) > 0}
            >
              {seedWorldCupFixtures.isPending ? 'GENERATING TEMPLATE...' : 'GENERATE WORLD CUP TEMPLATE'}
            </Button>
            {(fixtures?.length || 0) > 0 && (
              <span className="text-xs text-blue-900">
                Template generation is available only when fixture list is empty.
              </span>
            )}
          </div>
        </Card>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="font-headline text-xl uppercase">TEAM GROUP ASSIGNMENTS</h2>
              <p className="text-sm text-gray-600">
                Assign teams to Groups A-L before generating the fixture template. If left blank,
                the generator falls back to team order.
              </p>
            </div>
            <Button onClick={handleSaveGroups} disabled={bulkUpdateTeamGroups.isPending || !teams?.length}>
              {bulkUpdateTeamGroups.isPending ? 'SAVING GROUPS...' : 'SAVE GROUP ASSIGNMENTS'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {GROUPS.map((group) => (
              <span
                key={group}
                className={`px-3 py-1 text-xs font-semibold border-thin ${
                  (groupedTeamCounts[group] || 0) === 4
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-yellow-600 bg-yellow-50 text-yellow-800'
                }`}
              >
                Group {group}: {groupedTeamCounts[group] || 0}/4
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-thick border-gray-900">
                  <th className="text-left py-3 px-3 text-xs uppercase">Team</th>
                  <th className="text-left py-3 px-3 text-xs uppercase">Code</th>
                  <th className="text-left py-3 px-3 text-xs uppercase">Assigned Group</th>
                </tr>
              </thead>
              <tbody>
                {(teams || []).map((team) => (
                  <tr key={team.id} className="border-b-thin border-gray-300">
                    <td className="py-3 px-3 text-sm font-semibold">{team.name}</td>
                    <td className="py-3 px-3 text-sm">{team.code}</td>
                    <td className="py-3 px-3">
                      <select
                        value={groupDrafts[team.id] || ''}
                        onChange={(e) =>
                          setGroupDrafts((prev) => ({
                            ...prev,
                            [team.id]: e.target.value,
                          }))
                        }
                        className="w-full max-w-[180px] border-thin border-raw-black px-3 py-2 font-body"
                      >
                        <option value="">Unassigned</option>
                        {GROUPS.map((group) => (
                          <option key={group} value={group}>
                            Group {group}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-headline text-xs uppercase mb-1">Round</label>
              <select
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
              >
                <option value="all">All rounds</option>
                {ROUND_ORDER.map((round) => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-headline text-xs uppercase mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
              >
                <option value="all">All status</option>
                <option value="NS">Not started</option>
                <option value="LIVE">Live</option>
                <option value="HT">Half time</option>
                <option value="FT">Finished</option>
                <option value="PST">Postponed</option>
                <option value="CANC">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          {filteredFixtures.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No fixtures match current filters</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-thick border-gray-900">
                    <th className="text-left py-3 px-3 text-xs uppercase">Date</th>
                    <th className="text-left py-3 px-3 text-xs uppercase">Match</th>
                    <th className="text-left py-3 px-3 text-xs uppercase">Stage</th>
                    <th className="text-left py-3 px-3 text-xs uppercase">Status</th>
                    <th className="text-right py-3 px-3 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFixtures.map((fixture) => (
                    <tr key={fixture.id} className="border-b-thin border-gray-300">
                      <td className="py-3 px-3 text-sm">{new Date(fixture.match_date).toLocaleString()}</td>
                      <td className="py-3 px-3 text-sm font-semibold">
                        {fixture.home_team?.name} {fixture.home_score ?? '-'} - {fixture.away_score ?? '-'}{' '}
                        {fixture.away_team?.name}
                      </td>
                      <td className="py-3 px-3 text-sm">
                        {fixture.round}
                        {fixture.group_name ? ` · Group ${fixture.group_name}` : ''}
                      </td>
                      <td className="py-3 px-3 text-sm">{fixture.status}</td>
                      <td className="py-3 px-3">
                        <div className="flex justify-end gap-2">
                          <Button size="small" onClick={() => openEdit(fixture)}>
                            EDIT
                          </Button>
                          <Button
                            size="small"
                            variant="destructive"
                            onClick={() => setDeleteTarget(fixture)}
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
        title={formState.id ? 'EDIT FIXTURE' : 'NEW FIXTURE'}
        size="large"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block font-headline text-xs uppercase mb-1">Home team</label>
            <select
              value={formState.home_team_id}
              onChange={(e) => setFormState((prev) => ({ ...prev, home_team_id: e.target.value }))}
              className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
            >
              <option value="">Select home team</option>
              {(teams || []).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-headline text-xs uppercase mb-1">Away team</label>
            <select
              value={formState.away_team_id}
              onChange={(e) => setFormState((prev) => ({ ...prev, away_team_id: e.target.value }))}
              className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
            >
              <option value="">Select away team</option>
              {(teams || []).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Match Date"
            type="datetime-local"
            value={formState.match_date}
            onChange={(e) => setFormState((prev) => ({ ...prev, match_date: e.target.value }))}
          />

          <Input
            label="Venue"
            value={formState.venue}
            onChange={(e) => setFormState((prev) => ({ ...prev, venue: e.target.value }))}
          />

          <Input
            label="Referee"
            value={formState.referee}
            onChange={(e) => setFormState((prev) => ({ ...prev, referee: e.target.value }))}
          />

          <div>
            <label className="block font-headline text-xs uppercase mb-1">Status</label>
            <select
              value={formState.status}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, status: e.target.value as MatchStatus }))
              }
              className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
            >
              <option value="NS">Not started</option>
              <option value="LIVE">Live</option>
              <option value="HT">Half time</option>
              <option value="FT">Finished</option>
              <option value="PST">Postponed</option>
              <option value="CANC">Cancelled</option>
            </select>
          </div>

          <Input
            label="Home Score"
            type="number"
            value={formState.home_score}
            onChange={(e) => setFormState((prev) => ({ ...prev, home_score: e.target.value }))}
          />

          <Input
            label="Away Score"
            type="number"
            value={formState.away_score}
            onChange={(e) => setFormState((prev) => ({ ...prev, away_score: e.target.value }))}
          />

          <div>
            <label className="block font-headline text-xs uppercase mb-1">Round</label>
            <select
              value={formState.round}
              onChange={(e) => setFormState((prev) => ({ ...prev, round: e.target.value as Round }))}
              className="w-full border-thin border-raw-black px-3 py-2.5 font-body"
            >
              {ROUND_ORDER.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-headline text-xs uppercase mb-1">Group</label>
            <select
              value={formState.group_name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, group_name: e.target.value as Group }))
              }
              disabled={formState.round !== ROUNDS.GROUP_STAGE}
              className="w-full border-thin border-raw-black px-3 py-2.5 font-body disabled:bg-gray-100"
            >
              {GROUPS.map((group) => (
                <option key={group} value={group}>
                  Group {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={createFixture.isPending || updateFixture.isPending}>
            {createFixture.isPending || updateFixture.isPending ? 'SAVING...' : 'SAVE FIXTURE'}
          </Button>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>
            CANCEL
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="DELETE FIXTURE?"
      >
        <p className="text-gray-700 mb-6">
          This will permanently delete the selected fixture and related match details.
        </p>
        <div className="flex gap-3">
          <Button variant="destructive" onClick={handleDelete} disabled={deleteFixture.isPending}>
            {deleteFixture.isPending ? 'DELETING...' : 'DELETE'}
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            CANCEL
          </Button>
        </div>
      </Modal>
    </div>
  )
}
