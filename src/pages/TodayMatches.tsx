import { useTodayFixtures } from '@/hooks/useFixtures'
import FixtureCard from '@/components/fixtures/FixtureCard'
import Loading from '@/components/ui/Loading'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { format } from 'date-fns'

export default function TodayMatches() {
  const { data: todayFixtures, isLoading } = useTodayFixtures()
  
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')
  
  // Separate fixtures by status
  const liveFixtures = todayFixtures?.filter(f => f.status === 'LIVE' || f.status === 'HT') || []
  const upcomingFixtures = todayFixtures?.filter(f => f.status === 'NS') || []
  const finishedFixtures = todayFixtures?.filter(f => f.status === 'FT') || []
  
  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl uppercase">
              TODAY'S MATCHES
            </h1>
            {liveFixtures.length > 0 && (
              <Badge variant="error" className="animate-pulse">
                {liveFixtures.length} LIVE
              </Badge>
            )}
          </div>
          <p className="font-mono text-lg text-gray-700 uppercase">
            {today}
          </p>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loading size="large" text="Loading today's matches..." />
            </div>
          ) : !todayFixtures || todayFixtures.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <h3 className="font-headline text-3xl uppercase mb-4">
                  NO MATCHES TODAY
                </h3>
                <p className="font-body text-lg text-gray-600 mb-6">
                  There are no scheduled matches for today. Check back tomorrow or browse all fixtures.
                </p>
                <Link to="/fixtures">
                  <Button variant="primary">View All Fixtures</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-12">
              {/* Live Matches */}
              {liveFixtures.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-headline text-3xl uppercase">
                      LIVE NOW
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-raw-red rounded-full animate-pulse"></div>
                      <span className="font-mono text-sm uppercase text-raw-red">
                        {liveFixtures.length} {liveFixtures.length === 1 ? 'MATCH' : 'MATCHES'}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveFixtures.map(fixture => (
                      <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upcoming Today */}
              {upcomingFixtures.length > 0 && (
                <div>
                  <h2 className="font-headline text-3xl uppercase mb-6 pb-3 border-b-thick border-raw-black">
                    UPCOMING TODAY
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingFixtures.map(fixture => (
                      <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Finished Today */}
              {finishedFixtures.length > 0 && (
                <div>
                  <h2 className="font-headline text-3xl uppercase mb-6 pb-3 border-b-thick border-raw-black">
                    RESULTS TODAY
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {finishedFixtures.map(fixture => (
                      <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Quick Links */}
      {todayFixtures && todayFixtures.length > 0 && (
        <section className="border-t-thick border-raw-black bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4">
              <Link to="/fixtures">
                <Button variant="secondary">View All Fixtures</Button>
              </Link>
              <Link to="/standings">
                <Button variant="secondary">View Standings</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
