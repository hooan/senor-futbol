import { useActiveTournament } from '@/hooks/useActiveTournament'

export default function TournamentSelector() {
  const { activeTournament, activeTournamentId, setActiveTournamentId, tournaments, isLoading } =
    useActiveTournament()

  if (isLoading || tournaments.length === 0) {
    return null
  }

  // If only one tournament, don't show selector
  if (tournaments.length === 1) {
    return (
      <div className="border-thick border-raw-black bg-gray-50 px-4 py-3">
        <p className="font-headline text-sm uppercase">
          {activeTournament?.name || 'No Tournament Selected'}
        </p>
        <p className="font-mono text-xs text-gray-600">Season {activeTournament?.season}</p>
      </div>
    )
  }

  return (
    <div className="border-thick border-raw-black bg-white p-4">
      <label htmlFor="tournament-select" className="font-headline text-sm uppercase block mb-2">
        TOURNAMENT
      </label>
      <select
        id="tournament-select"
        value={activeTournamentId || ''}
        onChange={(e) => setActiveTournamentId(e.target.value)}
        className="w-full border-thin border-raw-black px-4 py-3 font-body bg-white focus:outline-none focus:border-thick"
      >
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>
            {tournament.name} ({tournament.season})
          </option>
        ))}
      </select>
    </div>
  )
}
