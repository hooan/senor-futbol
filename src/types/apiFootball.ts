// API-Football Response Types
// Based on API-Football v3 documentation

export interface ApiFootballResponse<T> {
  get: string
  parameters: Record<string, any>
  errors: Record<string, string> | []
  results: number
  paging: {
    current: number
    total: number
  }
  response: T[]
}

export interface ApiLeague {
  league: {
    id: number
    name: string
    type: string
    logo: string
  }
  country: {
    name: string
    code: string | null
    flag: string | null
  }
  seasons: ApiSeason[]
}

export interface ApiSeason {
  year: number
  start: string
  end: string
  current: boolean
  coverage: {
    fixtures: {
      events: boolean
      lineups: boolean
      statistics_fixtures: boolean
      statistics_players: boolean
    }
    standings: boolean
    players: boolean
    top_scorers: boolean
    top_assists: boolean
    top_cards: boolean
    injuries: boolean
    predictions: boolean
    odds: boolean
  }
}

export interface ApiFixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    periods: {
      first: number | null
      second: number | null
    }
    venue: {
      id: number | null
      name: string | null
      city: string | null
    }
    status: {
      long: string
      short: string
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
    extratime: {
      home: number | null
      away: number | null
    }
    penalty: {
      home: number | null
      away: number | null
    }
  }
}

export interface ApiTeam {
  team: {
    id: number
    name: string
    code: string | null
    country: string
    founded: number | null
    national: boolean
    logo: string
  }
  venue: {
    id: number | null
    name: string | null
    address: string | null
    city: string | null
    capacity: number | null
    surface: string | null
    image: string | null
  }
}

export interface ApiStanding {
  rank: number
  team: {
    id: number
    name: string
    logo: string
  }
  points: number
  goalsDiff: number
  group: string
  form: string | null
  status: string | null
  description: string | null
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  home: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  away: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  update: string
}

// Match Events (goals, cards, substitutions, VAR)
export interface ApiFixtureEvent {
  time: {
    elapsed: number
    extra: number | null
  }
  team: {
    id: number
    name: string
    logo: string
  }
  player: {
    id: number | null
    name: string
  }
  assist: {
    id: number | null
    name: string | null
  }
  type: string // 'Goal', 'Card', 'subst', 'Var'
  detail: string // 'Normal Goal', 'Yellow Card', 'Red Card', 'Substitution 1', etc.
  comments: string | null
}

// Match Lineups
export interface ApiFixtureLineup {
  team: {
    id: number
    name: string
    logo: string
    colors: {
      player: {
        primary: string
        number: string
        border: string
      }
      goalkeeper: {
        primary: string
        number: string
        border: string
      }
    } | null
  }
  formation: string
  startXI: Array<{
    player: {
      id: number | null
      name: string
      number: number
      pos: string
      grid: string | null
    }
  }>
  substitutes: Array<{
    player: {
      id: number | null
      name: string
      number: number
      pos: string
      grid: string | null
    }
  }>
  coach: {
    id: number | null
    name: string
    photo: string | null
  }
}

// Match Statistics
export interface ApiFixtureStatistic {
  team: {
    id: number
    name: string
    logo: string
  }
  statistics: Array<{
    type: string // 'Shots on Goal', 'Ball Possession', etc.
    value: number | string | null // can be '65%', 12, or null
  }>
}

// Full fixture detail with events, lineups, and statistics
export interface ApiFixtureDetail extends ApiFixture {
  events: ApiFixtureEvent[]
  lineups: ApiFixtureLineup[]
  statistics: ApiFixtureStatistic[]
}

// Team Squad/Roster
export interface ApiSquadPlayer {
  id: number
  name: string
  age: number | null
  number: number | null
  position: string
  photo: string | null
}
