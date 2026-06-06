import type {
  News,
  CreateNewsInput,
  UpdateNewsInput,
  User,
  NewsWithAuthor,
  Fixture,
  FixtureWithTeams,
  CreateFixtureInput,
  UpdateFixtureInput,
  Team,
  Player,
  CreatePlayerInput,
  UpdatePlayerInput,
} from '@/types/database'
import { supabase } from '@/lib/supabaseClient'
import { GROUPS, ROUNDS, WORLD_CUP_SEASON } from '@/lib/constants'

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

// Admin Service
export const adminService = {
  // ============= NEWS MANAGEMENT =============

  // Get all news (including unpublished)
  async getAllNews(): Promise<NewsWithAuthor[]> {
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        author:users(id, username, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as NewsWithAuthor[]
  },

  // Create news article
  async createNews(userId: string, input: CreateNewsInput): Promise<News> {
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt || null,
        author_id: userId,
        cover_image_url: input.cover_image_url || null,
        is_published: input.is_published,
        published_at: input.is_published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error
    return data as News
  },

  // Update news article
  async updateNews(input: UpdateNewsInput): Promise<News> {
    // First get the current article to check publish status
    const { data: currentArticle, error: fetchError } = await supabase
      .from('news')
      .select('is_published')
      .eq('id', input.id)
      .single()

    if (fetchError) throw fetchError

    const wasUnpublished = !currentArticle.is_published
    const nowPublished = input.is_published === true

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (input.title !== undefined) updates.title = input.title
    if (input.content !== undefined) updates.content = input.content
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt
    if (input.cover_image_url !== undefined) updates.cover_image_url = input.cover_image_url
    if (input.is_published !== undefined) updates.is_published = input.is_published

    // Set published_at if publishing for the first time
    if (wasUnpublished && nowPublished) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('news')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw error
    return data as News
  },

  // Delete news article
  async deleteNews(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Toggle publish status
  async togglePublish(id: string): Promise<News> {
    // Get current article
    const { data: currentArticle, error: fetchError } = await supabase
      .from('news')
      .select('is_published, published_at')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newPublishStatus = !currentArticle.is_published
    const updates: any = {
      is_published: newPublishStatus,
      updated_at: new Date().toISOString(),
    }

    // Set published_at if publishing for the first time
    if (newPublishStatus && !currentArticle.published_at) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('news')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as News
  },

  // ============= USER MANAGEMENT =============

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as User[]
  },

  // Toggle admin status
  async toggleAdmin(userId: string): Promise<User> {
    // Get current user
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: !currentUser.is_admin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  // Get user stats
  async getUserStats(): Promise<{
    total: number
    admins: number
    regular: number
    recentSignups: number
  }> {
    const { data: users, error } = await supabase
      .from('users')
      .select('is_admin, created_at')

    if (error) throw error

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      total: users.length,
      admins: users.filter((u) => u.is_admin).length,
      regular: users.filter((u) => !u.is_admin).length,
      recentSignups: users.filter((u) => new Date(u.created_at) > sevenDaysAgo).length,
    }
  },

  // ============= FIXTURES MANAGEMENT =============

  async getAllFixtures(tournamentId?: string): Promise<FixtureWithTeams[]> {
    let query = supabase
      .from('fixtures')
      .select(
        `
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `
      )
      .order('match_date', { ascending: true })

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as FixtureWithTeams[]
  },

  async createFixture(input: CreateFixtureInput): Promise<Fixture> {
    const payload = {
      tournament_id: input.tournament_id,
      home_team_id: input.home_team_id,
      away_team_id: input.away_team_id,
      match_date: input.match_date,
      venue: input.venue || null,
      referee: input.referee || null,
      status: input.status,
      home_score: input.home_score ?? null,
      away_score: input.away_score ?? null,
      round: input.round,
      group_name: input.group_name || null,
      api_fixture_id: input.api_fixture_id ?? null,
    }

    const { data, error } = await supabase.from('fixtures').insert(payload).select().single()
    if (error) throw error
    return data as Fixture
  },

  async updateFixture(input: UpdateFixtureInput): Promise<Fixture> {
    const updates: Partial<Fixture> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    }

    if (input.home_team_id !== undefined) updates.home_team_id = input.home_team_id
    if (input.away_team_id !== undefined) updates.away_team_id = input.away_team_id
    if (input.match_date !== undefined) updates.match_date = input.match_date
    if (input.venue !== undefined) updates.venue = input.venue
    if (input.referee !== undefined) updates.referee = input.referee
    if (input.status !== undefined) updates.status = input.status
    if (input.home_score !== undefined) updates.home_score = input.home_score
    if (input.away_score !== undefined) updates.away_score = input.away_score
    if (input.round !== undefined) updates.round = input.round
    if (input.group_name !== undefined) updates.group_name = input.group_name
    if (input.api_fixture_id !== undefined) updates.api_fixture_id = input.api_fixture_id

    const { data, error } = await supabase
      .from('fixtures')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw error
    return data as Fixture
  },

  async deleteFixture(id: string): Promise<void> {
    const { error } = await supabase.from('fixtures').delete().eq('id', id)
    if (error) throw error
  },

  async getTournamentTeams(tournamentId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as Team[]
  },

  async updateTeamGroup(teamId: string, groupName: string | null): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({ group_name: groupName })
      .eq('id', teamId)
      .select('*')
      .single()

    if (error) throw error
    return data as Team
  },

  async bulkUpdateTeamGroups(updates: Array<{ id: string; group_name: string | null }>): Promise<Team[]> {
    const results = await Promise.all(
      updates.map((update) => this.updateTeamGroup(update.id, update.group_name))
    )

    return results
  },

  async seedWorldCup2026FixtureTemplates(tournamentId: string): Promise<{ created: number }> {
    const { count, error: countError } = await supabase
      .from('fixtures')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)

    if (countError) throw countError

    if ((count || 0) > 0) {
      throw new Error('Fixtures already exist for this tournament. Template seed requires an empty fixture list.')
    }

    const teams = await this.getTournamentTeams(tournamentId)

    if (teams.length < 4) {
      throw new Error('At least 4 teams are required to generate fixture templates.')
    }

    const groupCount = Math.min(GROUPS.length, Math.floor(teams.length / 4))
    const expectedGroups = GROUPS.slice(0, groupCount)
    const validAssignedTeams = teams.filter(
      (team) => team.group_name && expectedGroups.includes(team.group_name as (typeof GROUPS)[number])
    )

    let groupedTeams: Team[][] = []

    if (validAssignedTeams.length === teams.length) {
      groupedTeams = expectedGroups.map((group) =>
        teams
          .filter((team) => team.group_name === group)
          .sort((left, right) => left.name.localeCompare(right.name))
      )

      const invalidGroup = groupedTeams.find((group) => group.length !== 4)
      if (invalidGroup) {
        throw new Error('Every assigned World Cup group must contain exactly 4 teams before generating fixtures.')
      }
    } else {
      groupedTeams = []
      for (let i = 0; i < groupCount; i++) {
        groupedTeams.push(teams.slice(i * 4, i * 4 + 4))
      }
    }

    const groupStageStart = new Date(`${WORLD_CUP_SEASON}-06-11T16:00:00Z`)
    const fixturesToInsert: Array<
      Omit<
        Fixture,
        'id' | 'created_at' | 'updated_at' | 'home_team' | 'away_team' | 'api_fixture_id'
      >
    > = []

    // Round-robin schedule for 4-team groups.
    const groupPairings: Array<[number, number]> = [
      [0, 1],
      [2, 3],
      [0, 2],
      [3, 1],
      [3, 0],
      [1, 2],
    ]

    groupedTeams.forEach((groupTeams, groupIndex) => {
      const groupName = GROUPS[groupIndex]

      groupPairings.forEach(([homeIdx, awayIdx], matchIndex) => {
        const matchDate = addDays(groupStageStart, groupIndex * 2 + Math.floor(matchIndex / 2))

        fixturesToInsert.push({
          tournament_id: tournamentId,
          home_team_id: groupTeams[homeIdx].id,
          away_team_id: groupTeams[awayIdx].id,
          match_date: matchDate.toISOString(),
          venue: null,
          referee: null,
          status: 'NS',
          home_score: null,
          away_score: null,
          round: ROUNDS.GROUP_STAGE,
          group_name: groupName,
        })
      })
    })

    const knockoutStart = addDays(groupStageStart, 24)
    const firstTeamFromEachGroup = groupedTeams.map((group) => group[0])
    const secondTeamFromEachGroup = groupedTeams.map((group) => group[1])
    const thirdTeams = groupedTeams.map((group) => group[2]).slice(0, 8)

    const round32Teams = [...firstTeamFromEachGroup, ...secondTeamFromEachGroup, ...thirdTeams].slice(0, 32)
    const round16Teams = round32Teams.slice(0, 16)
    const quarterTeams = round16Teams.slice(0, 8)
    const semiTeams = quarterTeams.slice(0, 4)

    const pushKnockoutMatches = (
      teamsForRound: Team[],
      round: string,
      startDate: Date,
      gapDays: number
    ) => {
      for (let i = 0; i < teamsForRound.length; i += 2) {
        const home = teamsForRound[i]
        const away = teamsForRound[i + 1]

        if (!home || !away) continue

        fixturesToInsert.push({
          tournament_id: tournamentId,
          home_team_id: home.id,
          away_team_id: away.id,
          match_date: addDays(startDate, Math.floor(i / 2 / gapDays)).toISOString(),
          venue: null,
          referee: null,
          status: 'NS',
          home_score: null,
          away_score: null,
          round,
          group_name: null,
        })
      }
    }

    pushKnockoutMatches(round32Teams, ROUNDS.ROUND_32, knockoutStart, 2)
    pushKnockoutMatches(round16Teams, ROUNDS.ROUND_16, addDays(knockoutStart, 6), 2)
    pushKnockoutMatches(quarterTeams, ROUNDS.QUARTER_FINAL, addDays(knockoutStart, 10), 2)
    pushKnockoutMatches(semiTeams, ROUNDS.SEMI_FINAL, addDays(knockoutStart, 14), 1)

    if (semiTeams.length >= 4) {
      fixturesToInsert.push({
        tournament_id: tournamentId,
        home_team_id: semiTeams[0].id,
        away_team_id: semiTeams[1].id,
        match_date: addDays(knockoutStart, 18).toISOString(),
        venue: null,
        referee: null,
        status: 'NS',
        home_score: null,
        away_score: null,
        round: ROUNDS.THIRD_PLACE,
        group_name: null,
      })

      fixturesToInsert.push({
        tournament_id: tournamentId,
        home_team_id: semiTeams[2].id,
        away_team_id: semiTeams[3].id,
        match_date: addDays(knockoutStart, 19).toISOString(),
        venue: null,
        referee: null,
        status: 'NS',
        home_score: null,
        away_score: null,
        round: ROUNDS.FINAL,
        group_name: null,
      })
    }

    const { error } = await supabase.from('fixtures').insert(fixturesToInsert)
    if (error) throw error

    return { created: fixturesToInsert.length }
  },

  // ============= ROSTERS MANAGEMENT =============

  async getRosterByTeam(teamId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('position', { ascending: true })
      .order('number', { ascending: true })

    if (error) throw error
    return (data || []) as Player[]
  },

  async createPlayer(input: CreatePlayerInput): Promise<Player> {
    const payload = {
      team_id: input.team_id,
      api_player_id: input.api_player_id,
      name: input.name,
      age: input.age ?? null,
      number: input.number ?? null,
      position: input.position || null,
      photo_url: input.photo_url || null,
    }

    const { data, error } = await supabase.from('players').insert(payload).select().single()
    if (error) throw error
    return data as Player
  },

  async updatePlayer(input: UpdatePlayerInput): Promise<Player> {
    const updates: Partial<Player> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    }

    if (input.api_player_id !== undefined) updates.api_player_id = input.api_player_id
    if (input.name !== undefined) updates.name = input.name
    if (input.age !== undefined) updates.age = input.age
    if (input.number !== undefined) updates.number = input.number
    if (input.position !== undefined) updates.position = input.position
    if (input.photo_url !== undefined) updates.photo_url = input.photo_url

    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw error
    return data as Player
  },

  async deletePlayer(id: string): Promise<void> {
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) throw error
  },

  // ============= STATS & ANALYTICS =============

  // Get dashboard stats
  async getDashboardStats(): Promise<{
    totalNews: number
    publishedNews: number
    draftNews: number
    totalUsers: number
    totalQuinielas: number
  }> {
    const [newsResult, usersResult, quinielasResult] = await Promise.all([
      supabase.from('news').select('is_published', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('quinielas').select('id', { count: 'exact', head: true }),
    ])

    if (newsResult.error) throw newsResult.error
    if (usersResult.error) throw usersResult.error
    if (quinielasResult.error) throw quinielasResult.error

    // Get published vs draft counts
    const { data: allNews } = await supabase.from('news').select('is_published')
    const publishedCount = allNews?.filter((n) => n.is_published).length || 0
    const draftCount = allNews?.filter((n) => !n.is_published).length || 0

    return {
      totalNews: newsResult.count || 0,
      publishedNews: publishedCount,
      draftNews: draftCount,
      totalUsers: usersResult.count || 0,
      totalQuinielas: quinielasResult.count || 0,
    }
  },
}
