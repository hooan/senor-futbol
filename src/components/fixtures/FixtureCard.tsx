import { format } from 'date-fns'
import { FixtureWithTeams } from '@/types/database'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface FixtureCardProps {
  fixture: FixtureWithTeams
}

export default function FixtureCard({ fixture }: FixtureCardProps) {
  const matchDate = new Date(fixture.match_date)
  const dateStr = format(matchDate, 'MMM d, yyyy')
  const timeStr = format(matchDate, 'HH:mm')
  
  const getStatusBadge = () => {
    switch (fixture.status) {
      case 'NS':
        return <Badge variant="default">NOT STARTED</Badge>
      case 'LIVE':
        return <Badge variant="error">LIVE</Badge>
      case 'HT':
        return <Badge variant="warning">HALF TIME</Badge>
      case 'FT':
        return <Badge variant="success">FINISHED</Badge>
      default:
        return <Badge variant="default">{fixture.status}</Badge>
    }
  }
  
  return (
    <Card className="hover:border-heavy transition-all cursor-pointer">
      <div className="space-y-4">
        {/* Header: Date, Time, Status */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-mono text-xs uppercase">{dateStr}</p>
            <p className="font-mono text-tiny text-gray-600">{timeStr}</p>
          </div>
          {getStatusBadge()}
        </div>
        
        {/* Teams and Score */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-thin border-raw-black flex items-center justify-center">
                <span className="font-mono text-xs">{fixture.home_team.code}</span>
              </div>
              <span className="font-body font-semibold">{fixture.home_team.name}</span>
            </div>
            {fixture.status === 'FT' && (
              <span className="font-headline text-2xl">{fixture.home_score ?? '-'}</span>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-thin border-raw-black flex items-center justify-center">
                <span className="font-mono text-xs">{fixture.away_team.code}</span>
              </div>
              <span className="font-body font-semibold">{fixture.away_team.name}</span>
            </div>
            {fixture.status === 'FT' && (
              <span className="font-headline text-2xl">{fixture.away_score ?? '-'}</span>
            )}
          </div>
        </div>
        
        {/* Footer: Round, Group, Venue */}
        <div className="pt-3 border-t-thin border-gray-300">
          <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-600">
            <span className="uppercase">{fixture.round}</span>
            {fixture.group_name && (
              <>
                <span>•</span>
                <span>GROUP {fixture.group_name}</span>
              </>
            )}
            {fixture.venue && (
              <>
                <span>•</span>
                <span className="truncate">{fixture.venue}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
