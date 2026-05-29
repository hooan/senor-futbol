import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { FixtureWithTeams } from '@/types/database'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface FixtureCardProps {
  fixture: FixtureWithTeams
}

export default function FixtureCard({ fixture }: FixtureCardProps) {
  const navigate = useNavigate()
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

  const handleTeamClick = (e: React.MouseEvent, teamId: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/teams/${teamId}`)
  }

  const handleMatchClick = () => {
    navigate(`/fixtures/${fixture.id}`)
  }
  
  return (
    <Card className="hover:border-heavy transition-all cursor-pointer" onClick={handleMatchClick}>
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
          {/* Home Team - Clickable */}
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center gap-3 hover:bg-blue-50 p-2 -m-2 rounded transition-colors cursor-pointer"
              onClick={(e) => handleTeamClick(e, fixture.home_team_id)}
            >
              <div className="w-10 h-10 border-thin border-raw-black flex items-center justify-center bg-white overflow-hidden">
                {fixture.home_team.logo_url ? (
                  <img 
                    src={fixture.home_team.logo_url} 
                    alt={fixture.home_team.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="font-mono text-xs">{fixture.home_team.code}</span>
                )}
              </div>
              <span className="font-body font-semibold">{fixture.home_team.name}</span>
            </div>
            {fixture.status === 'FT' && (
              <span className="font-headline text-2xl">{fixture.home_score ?? '-'}</span>
            )}
          </div>
          
          {/* Away Team - Clickable */}
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center gap-3 hover:bg-red-50 p-2 -m-2 rounded transition-colors cursor-pointer"
              onClick={(e) => handleTeamClick(e, fixture.away_team_id)}
            >
              <div className="w-10 h-10 border-thin border-raw-black flex items-center justify-center bg-white overflow-hidden">
                {fixture.away_team.logo_url ? (
                  <img 
                    src={fixture.away_team.logo_url} 
                    alt={fixture.away_team.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="font-mono text-xs">{fixture.away_team.code}</span>
                )}
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
