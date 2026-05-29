import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { DataSyncService } from '@/services/dataSync'
import { apiFootball } from '@/services/apiFootball'
import { useTournaments } from '@/hooks/useTournaments'

interface AvailableTournament {
  id: string
  leagueId: number
  season: number
  name: string
  description: string
  matches: number
  teams: number
}

const AVAILABLE_TOURNAMENTS: AvailableTournament[] = [
  {
    id: 'gc-2023',
    leagueId: 22,
    season: 2023,
    name: 'CONCACAF Gold Cup 2023',
    description: 'Most recent Gold Cup - Perfect for testing quinielas with real data',
    matches: 31,
    teams: 12,
  },
  {
    id: 'gc-2021',
    leagueId: 22,
    season: 2021,
    name: 'CONCACAF Gold Cup 2021',
    description: 'Previous Gold Cup tournament with complete results',
    matches: 31,
    teams: 12,
  },
  {
    id: 'nl-2024',
    leagueId: 536,
    season: 2024,
    name: 'CONCACAF Nations League 2024',
    description: 'Nations League competition',
    matches: 0,
    teams: 16,
  },
  {
    id: 'nl-2022',
    leagueId: 536,
    season: 2022,
    name: 'CONCACAF Nations League 2022',
    description: 'Nations League competition',
    matches: 0,
    teams: 16,
  },
]

export default function AdminTournaments() {
  const [importing, setImporting] = useState<string | null>(null)
  const [importedTournaments, setImportedTournaments] = useState<string[]>([])
  const [progress, setProgress] = useState('')
  const toast = useToast()
  const { data: tournaments, isLoading, refetch } = useTournaments()

  const handleImport = async (tournament: AvailableTournament) => {
    setImporting(tournament.id)
    setProgress('Starting import...')

    try {
      const syncService = new DataSyncService()

      // Step 1: Fetch tournament info
      setProgress('Fetching tournament info...')
      const league = await apiFootball.getLeague(tournament.leagueId)
      
      if (!league) {
        throw new Error(`League ${tournament.leagueId} not found`)
      }

      // Step 2: Fetch fixtures
      setProgress(`Fetching fixtures from API-Football...`)
      const fixtures = await apiFootball.getFixturesByLeague(tournament.leagueId, tournament.season)
      
      if (fixtures.length === 0) {
        throw new Error(`No fixtures found for ${tournament.name}`)
      }

      setProgress(`Found ${fixtures.length} fixtures. Importing to database...`)

      // Step 3: Import to database with progress callback
      const result = await syncService.syncTournament(
        tournament.leagueId,
        tournament.season,
        tournament.name,
        (msg) => setProgress(msg) // Progress callback for live updates
      )

      if (!result.success) {
        throw new Error(result.errors.join(', '))
      }

      // Success
      toast.showToast(
        `✅ Imported: ${result.teamsImported} teams, ${result.fixturesImported} fixtures, ${result.standingsImported} standings, ${result.eventsImported} events, ${result.lineupsImported} lineups, ${result.playersImported} players`,
        'success',
        5000
      )
      
      setImportedTournaments([...importedTournaments, tournament.id])
      setProgress('')
      
      // Refetch tournaments list
      refetch()

    } catch (error) {
      console.error('Import error:', error)
      toast.showToast(
        error instanceof Error ? error.message : 'Failed to import tournament',
        'error'
      )
      setProgress('')
    } finally {
      setImporting(null)
    }
  }

  const isImporting = importing !== null
  const apiRequestsUsed = apiFootball.getRequestCount()
  const apiRequestsRemaining = apiFootball.getRemainingRequests()

  return (
    <div className="min-h-screen bg-raw-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-5xl uppercase mb-4">IMPORT TOURNAMENTS</h1>
          <p className="font-body text-gray-700 text-lg mb-4">
            Import real tournament data from API-Football with one click
          </p>
          
          {/* API Usage */}
          <div className="border-thick border-raw-black bg-gray-50 p-4">
            <p className="font-body font-semibold mb-2">API Usage Today:</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 border-thin border-raw-black">
                  <div 
                    className="h-full bg-raw-blue"
                    style={{ width: `${apiRequestsUsed}%` }}
                  />
                </div>
              </div>
              <p className="font-mono text-sm">
                {apiRequestsUsed}/100 requests used ({apiRequestsRemaining} remaining)
              </p>
            </div>
            {apiRequestsRemaining < 10 && (
              <p className="font-body text-sm text-raw-red mt-2">
                ⚠️ Warning: API rate limit approaching!
              </p>
            )}
          </div>
        </div>

        {/* Imported Tournaments */}
        {!isLoading && tournaments && tournaments.length > 0 && (
          <Card variant="elevated" className="mb-8 bg-green-50 border-green-600">
            <h2 className="font-headline text-2xl uppercase mb-4">IMPORTED TOURNAMENTS ({tournaments.length})</h2>
            <div className="space-y-3">
              {tournaments.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-thin border-green-600 bg-white p-4">
                  <div>
                    <p className="font-headline text-lg uppercase">{t.name}</p>
                    <p className="font-mono text-sm text-gray-600">Season {t.season}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-body text-sm text-gray-600">Imported</p>
                      <p className="font-mono text-xs">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-600 text-white flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progress */}
        {progress && (
          <Card variant="elevated" className="mb-8 bg-blue-50 border-raw-blue">
            <div className="flex items-center gap-4">
              <div className="animate-spin h-6 w-6 border-3 border-raw-blue border-t-transparent rounded-full" />
              <p className="font-body font-semibold">{progress}</p>
            </div>
          </Card>
        )}

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AVAILABLE_TOURNAMENTS.map((tournament) => {
            const isCurrentlyImporting = importing === tournament.id
            const isImported = importedTournaments.includes(tournament.id)

            return (
              <Card key={tournament.id} variant="elevated">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-headline text-2xl uppercase">{tournament.name}</h3>
                    {isImported && (
                      <span className="bg-green-100 border-thin border-green-600 px-3 py-1 font-body text-sm text-green-700">
                        ✓ IMPORTED
                      </span>
                    )}
                  </div>
                  <p className="font-body text-gray-600">{tournament.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border-thin border-gray-300 p-3">
                    <p className="font-body text-sm text-gray-600">League ID</p>
                    <p className="font-mono text-xl font-bold">{tournament.leagueId}</p>
                  </div>
                  <div className="border-thin border-gray-300 p-3">
                    <p className="font-body text-sm text-gray-600">Season</p>
                    <p className="font-mono text-xl font-bold">{tournament.season}</p>
                  </div>
                  {tournament.matches > 0 && (
                    <>
                      <div className="border-thin border-gray-300 p-3">
                        <p className="font-body text-sm text-gray-600">Matches</p>
                        <p className="font-mono text-xl font-bold">~{tournament.matches}</p>
                      </div>
                      <div className="border-thin border-gray-300 p-3">
                        <p className="font-body text-sm text-gray-600">Teams</p>
                        <p className="font-mono text-xl font-bold">{tournament.teams}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Import Button */}
                <Button
                  variant="primary"
                  onClick={() => handleImport(tournament)}
                  disabled={isImporting || isImported}
                  className="w-full"
                >
                  {isCurrentlyImporting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      IMPORTING...
                    </span>
                  ) : isImported ? (
                    'ALREADY IMPORTED'
                  ) : (
                    'IMPORT TOURNAMENT'
                  )}
                </Button>

                {/* Info */}
                <p className="font-body text-xs text-gray-500 mt-3 text-center">
                  Uses ~3 API requests
                </p>
              </Card>
            )
          })}
        </div>

        {/* Instructions */}
        <Card variant="elevated" className="mt-8">
          <h3 className="font-headline text-2xl uppercase mb-4">HOW IT WORKS</h3>
          <ol className="space-y-3 font-body text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Click "IMPORT TOURNAMENT" on any tournament card above</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Wait while the app fetches data from API-Football and imports to database</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Once complete, visit the Fixtures page to see the real tournament data</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Create quinielas using the imported fixtures and test predictions with real results!</span>
            </li>
          </ol>

          <div className="mt-6 border-t-thin border-gray-300 pt-6">
            <h4 className="font-headline text-lg uppercase mb-3">RECOMMENDED</h4>
            <p className="font-body text-gray-700">
              Start with <strong>CONCACAF Gold Cup 2023</strong> - it's the most recent completed tournament 
              with all results available, perfect for testing the quiniela scoring system.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
