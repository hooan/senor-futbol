import { News, NewsWithAuthor, User } from '@/types/database'

// Mock author
const mockAuthor: User = {
  id: 'admin-1',
  username: 'admin',
  avatar_url: null,
  is_admin: true,
  created_at: new Date().toISOString(),
}

// Mock news articles
export const mockNews: News[] = [
  {
    id: 'news-1',
    title: 'FIFA Announces World Cup 2026 Draw Results',
    excerpt: 'The official draw for the FIFA World Cup 2026 has been completed, determining the groups for all 32 participating nations.',
    content: `The FIFA World Cup 2026 draw took place today in New York City, with all 32 qualified nations learning their group stage opponents.

**GROUP STAGE BREAKDOWN**

The tournament, which will be co-hosted by the United States, Canada, and Mexico, features an exciting mix of football powerhouses and emerging nations.

Group A sees hosts United States paired with Brazil, England, and Japan in what promises to be a thrilling opening group. The American team will be under pressure to perform on home soil.

Group B features Mexico, another host nation, alongside France, Uruguay, and South Korea. This group could be one of the toughest in the tournament.

**TOURNAMENT FORMAT**

The 2026 World Cup will feature 64 matches across 16 cities in the three host nations. The group stage will run from June 11-26, followed by the knockout rounds leading to the final on July 19, 2026.

Each group winner and runner-up will advance to the Round of 16, where the knockout stage begins.`,
    author_id: mockAuthor.id,
    cover_image_url: null,
    published_at: new Date('2026-01-15').toISOString(),
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date('2026-01-15').toISOString(),
    is_published: true,
  },
  {
    id: 'news-2',
    title: 'Brazil Announces Final 26-Man Squad for World Cup',
    excerpt: 'The Brazilian Football Confederation has revealed their roster for the upcoming World Cup, with several surprise inclusions.',
    content: `Brazil has announced its 26-man squad for the FIFA World Cup 2026, with head coach selecting a blend of experience and youth.

**KEY SELECTIONS**

The squad features a mix of established stars and promising young talents. The attacking lineup looks particularly strong, with world-class forwards expected to lead the line.

**TACTICAL APPROACH**

Coach has indicated the team will play an attacking style of football, staying true to Brazil's traditional approach while incorporating modern tactical elements.

The five-time world champions will be looking to add a sixth star to their jersey and are among the favorites to lift the trophy.`,
    author_id: mockAuthor.id,
    cover_image_url: null,
    published_at: new Date('2026-04-20').toISOString(),
    created_at: new Date('2026-04-20').toISOString(),
    updated_at: new Date('2026-04-20').toISOString(),
    is_published: true,
  },
  {
    id: 'news-3',
    title: 'World Cup 2026: Tournament Preview and Predictions',
    excerpt: 'With just weeks to go before kickoff, we analyze the favorites, dark horses, and potential surprises of the tournament.',
    content: `As we approach the FIFA World Cup 2026, anticipation is building for what promises to be an unforgettable tournament.

**THE FAVORITES**

Brazil, France, and England enter as the bookmakers' favorites. All three teams have world-class squads and have shown excellent form in recent competitions.

**DARK HORSES**

Teams like Portugal, Argentina, and the Netherlands could surprise many. These nations have talented squads capable of beating anyone on their day.

**HOST NATIONS**

The United States, Mexico, and Canada will all be hoping to use home advantage to progress deep into the tournament. The atmosphere in the stadiums is expected to be electric.

**OPENING MATCH**

The tournament kicks off on June 11, 2026, with a highly anticipated opening ceremony followed by the first match. The world will be watching as the greatest show in football begins.`,
    author_id: mockAuthor.id,
    cover_image_url: null,
    published_at: new Date('2026-05-25').toISOString(),
    created_at: new Date('2026-05-25').toISOString(),
    updated_at: new Date('2026-05-25').toISOString(),
    is_published: true,
  },
  {
    id: 'news-4',
    title: 'Venues Ready: A Look at the 16 World Cup Stadiums',
    excerpt: 'From the iconic Azteca to state-of-the-art new venues, the 2026 World Cup will showcase world-class facilities.',
    content: `The FIFA World Cup 2026 will be played across 16 venues in the United States, Canada, and Mexico, each offering unique characteristics and atmosphere.

**ICONIC STADIUMS**

The Estadio Azteca in Mexico City will host matches for the third World Cup, a record. This historic venue has witnessed some of football's greatest moments.

**MODERN MARVELS**

State-of-the-art stadiums like SoFi Stadium in Los Angeles and AT&T Stadium in Dallas will bring modern amenities and technology to enhance the fan experience.

**CAPACITY AND ACCESSIBILITY**

All venues meet FIFA's strict standards and have been upgraded to provide world-class facilities for players and fans alike.`,
    author_id: mockAuthor.id,
    cover_image_url: null,
    published_at: new Date('2026-03-10').toISOString(),
    created_at: new Date('2026-03-10').toISOString(),
    updated_at: new Date('2026-03-10').toISOString(),
    is_published: true,
  },
  {
    id: 'news-5',
    title: 'Technology at the World Cup: VAR and Beyond',
    excerpt: 'FIFA introduces new technological innovations for the 2026 tournament to improve fairness and fan engagement.',
    content: `FIFA has announced several technological enhancements for the 2026 World Cup, building on innovations from previous tournaments.

**VAR IMPROVEMENTS**

The Video Assistant Referee system will be faster and more accurate, with new cameras and AI-assisted offside detection reducing decision times.

**SEMI-AUTOMATED OFFSIDE**

Building on Qatar 2022's success, the semi-automated offside technology will provide near-instant decisions on marginal offside calls.

**FAN ENGAGEMENT**

New mobile apps will provide real-time statistics, multi-camera angles, and interactive features to enhance the viewing experience both in stadiums and at home.

**PLAYER TRACKING**

Advanced player tracking technology will provide detailed performance data, helping coaches make informed decisions and giving fans deeper insights.`,
    author_id: mockAuthor.id,
    cover_image_url: null,
    published_at: new Date('2026-02-01').toISOString(),
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString(),
    is_published: true,
  },
]

// Helper to get news with author
export function getNewsWithAuthor(): NewsWithAuthor[] {
  return mockNews.map(news => ({
    ...news,
    author: mockAuthor,
  }))
}

// Helper to get published news
export function getPublishedNews(): NewsWithAuthor[] {
  return getNewsWithAuthor()
    .filter(news => news.is_published && news.published_at)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
}

// Helper to get news by ID
export function getNewsById(id: string): NewsWithAuthor | undefined {
  const news = mockNews.find(n => n.id === id)
  if (!news) return undefined
  return {
    ...news,
    author: mockAuthor,
  }
}

// Helper to get latest news
export function getLatestNews(limit = 5): NewsWithAuthor[] {
  return getPublishedNews().slice(0, limit)
}
