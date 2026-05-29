import { useState } from 'react'
import { useUpcomingFixtures, useFinishedFixtures } from '@/hooks/useFixtures'
import { useActiveTournament } from '@/hooks/useActiveTournament'
import FixtureCard from '@/components/fixtures/FixtureCard'
import Loading from '@/components/ui/Loading'
import Chip from '@/components/ui/Chip'
import TournamentSelector from '@/components/TournamentSelector'

export default function Fixtures() {
  const [filter, setFilter] = useState<'upcoming' | 'results'>('upcoming')
  const { activeTournament, activeTournamentId } = useActiveTournament()
  
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures(20, activeTournamentId || undefined)
  const { data: finishedFixtures, isLoading: finishedLoading } = useFinishedFixtures(20, activeTournamentId || undefined)
  
  const fixtures = filter === 'upcoming' ? upcomingFixtures : finishedFixtures
  const isLoading = filter === 'upcoming' ? upcomingLoading : finishedLoading
  
  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-headline text-5xl md:text-6xl uppercase mb-4">
            FIXTURES
          </h1>
          <p className="font-body text-lg text-gray-700">
            {activeTournament?.name || 'Tournament'} match schedule and results
          </p>
        </div>
      </section>

      {/* Tournament Selector */}
      <section className="border-b-thick border-raw-black bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TournamentSelector />
        </div>
      </section>
      
      {/* Filters */}
      <section className="border-b-thick border-raw-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3">
            <Chip
              variant="filter"
              active={filter === 'upcoming'}
              onClick={() => setFilter('upcoming')}
            >
              UPCOMING
            </Chip>
            <Chip
              variant="filter"
              active={filter === 'results'}
              onClick={() => setFilter('results')}
            >
              RESULTS
            </Chip>
          </div>
        </div>
      </section>
      
      {/* Fixtures List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loading size="large" text="Loading fixtures..." />
            </div>
          ) : !fixtures || fixtures.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-xl text-gray-600">
                No {filter} fixtures found
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fixtures.map(fixture => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
