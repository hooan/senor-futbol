import { supabase } from '@/lib/supabaseClient'
import type {
  User,
  Quiniela,
  QuinielaWithDetails,
  QuinielaParticipant,
  QuinielaPrediction,
  LeaderboardEntry,
  CreateQuinielaInput,
  MakePredictionInput,
  FixtureWithTeams,
} from '@/types/database'

// ─── Internal Supabase row types ──────────────────────────────────────────────

interface QuinielaRow extends Quiniela {
  creator: User
  quiniela_participants: Array<{ count: number }>
}

interface PredictionWithFixtureRow {
  participant_id: string | null
  predicted_home_score: number
  predicted_away_score: number
  fixture:
    | {
        home_score: number | null
        away_score: number | null
        status: string | null
      }
    | Array<{
        home_score: number | null
        away_score: number | null
        status: string | null
      }>
    | null
}

interface FixtureScoreRow {
  home_score: number | null
  away_score: number | null
  status: string | null
}

const toFixtureScoreRow = (
  fixture: PredictionWithFixtureRow['fixture']
): FixtureScoreRow | null => {
  if (!fixture) return null
  return Array.isArray(fixture) ? fixture[0] ?? null : fixture
}

interface PredictionWithFixtureDataRow {
  participant_id: string | null
  predicted_home_score: number
  predicted_away_score: number
  fixture: {
    home_score: number | null
    away_score: number | null
    status: string | null
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUINIELA_SELECT = `
  *,
  creator:users!quinielas_creator_id_fkey(id, username, avatar_url, is_admin, created_at),
  quiniela_participants(count)
` as const

const toQuinielaWithDetails = (row: QuinielaRow): QuinielaWithDetails => ({
  ...row,
  creator: row.creator,
  participants_count: row.quiniela_participants?.[0]?.count ?? 0,
})

/** Generate a unique 8-char alphanumeric share code with up to 5 collision retries. */
const generateShareCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const { data } = await supabase
      .from('quinielas')
      .select('id')
      .eq('share_code', code)
      .maybeSingle()
    if (!data) return code
  }
  throw new Error('Failed to generate a unique share code — please try again')
}

/**
 * Resolve participant_id from either a userId (auth) or guestToken (guest).
 * Returns null if no match found.
 */
const resolveParticipantId = async (
  quinielaId: string,
  userId: string | null,
  guestToken: string | null
): Promise<string | null> => {
  if (!userId && !guestToken) return null

  let query = supabase.from('quiniela_participants').select('id')

  if (userId) {
    query = query.eq('quiniela_id', quinielaId).eq('user_id', userId)
  } else {
    // guest_token is globally unique — no need to also filter by quiniela_id
    query = query.eq('guest_token', guestToken!)
  }

  const { data } = await query.maybeSingle()
  return (data?.id as string) ?? null
}

// ─── Point calculation (mirrors DB function) ──────────────────────────────────

/**
 * Client-side scoring that mirrors the DB `calculate_prediction_points` function.
 * exact = 5 pts | correct result = 3 pts | correct goal diff = +1 pt (additive).
 */
export const calculatePredictionPoints = (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number => {
  if (predictedHome === actualHome && predictedAway === actualAway) return 5

  const predictedDiff = predictedHome - predictedAway
  const actualDiff = actualHome - actualAway

  let points = 0

  if (
    (predictedDiff > 0 && actualDiff > 0) ||
    (predictedDiff < 0 && actualDiff < 0) ||
    (predictedDiff === 0 && actualDiff === 0)
  ) {
    points += 3
  }

  if (predictedDiff === actualDiff) {
    points += 1
  }

  return points
}

const getParticipantScoreAndCountMaps = async (quinielaId: string) => {
  const { data, error } = await supabase
    .from('quiniela_predictions')
    .select(`
      participant_id,
      predicted_home_score,
      predicted_away_score,
      fixture:fixtures!quiniela_predictions_fixture_id_fkey(home_score, away_score, status)
    `)
    .eq('quiniela_id', quinielaId)

  if (error) throw error

  const totalPointsByParticipant = new Map<string, number>()
  const predictionCountByParticipant = new Map<string, number>()

  for (const row of (data || []) as PredictionWithFixtureDataRow[]) {
    if (!row.participant_id) continue

    predictionCountByParticipant.set(
      row.participant_id,
      (predictionCountByParticipant.get(row.participant_id) ?? 0) + 1
    )

    const fixture = toFixtureScoreRow(row.fixture)
    const isFinished = fixture?.status === 'FT'
    const hasFinalScore = fixture?.home_score !== null && fixture?.away_score !== null
    if (!isFinished || !hasFinalScore) continue

    const points = calculatePredictionPoints(
      row.predicted_home_score,
      row.predicted_away_score,
      fixture.home_score as number,
      fixture.away_score as number
    )

    totalPointsByParticipant.set(
      row.participant_id,
      (totalPointsByParticipant.get(row.participant_id) ?? 0) + points
    )
  }

  return { totalPointsByParticipant, predictionCountByParticipant }
}

// ─── Quiniela Service ──────────────────────────────────────────────────────────

export const quinielaService = {
  /** All public quinielas, newest first. */
  async getPublicQuinielas(): Promise<QuinielaWithDetails[]> {
    const { data, error } = await supabase
      .from('quinielas')
      .select(QUINIELA_SELECT)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as QuinielaRow[]).map(toQuinielaWithDetails)
  },

  /** Quinielas the user created OR joined as a participant, newest first. */
  async getUserQuinielas(userId: string): Promise<QuinielaWithDetails[]> {
    const { data: created, error: e1 } = await supabase
      .from('quinielas')
      .select(QUINIELA_SELECT)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (e1) throw e1

    const { data: participantRows, error: e2 } = await supabase
      .from('quiniela_participants')
      .select('quiniela_id')
      .eq('user_id', userId)

    if (e2) throw e2

    const createdIds = new Set((created || []).map((q) => q.id))
    const joinedIds = (participantRows || [])
      .map((r) => r.quiniela_id as string)
      .filter((id) => !createdIds.has(id))

    let joined: QuinielaRow[] = []
    if (joinedIds.length > 0) {
      const { data: joinedData, error: e3 } = await supabase
        .from('quinielas')
        .select(QUINIELA_SELECT)
        .in('id', joinedIds)
        .order('created_at', { ascending: false })

      if (e3) throw e3
      joined = (joinedData as QuinielaRow[]) || []
    }

    return [...((created as QuinielaRow[]) || []), ...joined].map(toQuinielaWithDetails)
  },

  /** Single quiniela by UUID. */
  async getQuiniela(id: string): Promise<QuinielaWithDetails | null> {
    const { data, error } = await supabase
      .from('quinielas')
      .select(QUINIELA_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return toQuinielaWithDetails(data as QuinielaRow)
  },

  /** Single quiniela by share code. */
  async getQuinielaByShareCode(shareCode: string): Promise<QuinielaWithDetails | null> {
    const { data, error } = await supabase
      .from('quinielas')
      .select(QUINIELA_SELECT)
      .eq('share_code', shareCode)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return toQuinielaWithDetails(data as QuinielaRow)
  },

  /**
   * Create a quiniela and link its fixture IDs via quiniela_fixtures.
   * Rolls back the quiniela row if fixture insertion fails.
   */
  async createQuiniela(userId: string, input: CreateQuinielaInput): Promise<Quiniela> {
    const shareCode = await generateShareCode()

    const { data, error } = await supabase
      .from('quinielas')
      .insert({
        name: input.name,
        description: input.description || null,
        creator_id: userId,
        is_public: input.is_public,
        share_code: shareCode,
        deadline: input.deadline,
      })
      .select()
      .single()

    if (error) throw error

    if (input.fixture_ids.length > 0) {
      const { error: fxError } = await supabase.from('quiniela_fixtures').insert(
        input.fixture_ids.map((fixture_id) => ({
          quiniela_id: data.id,
          fixture_id,
        }))
      )

      if (fxError) {
        await supabase.from('quinielas').delete().eq('id', data.id)
        throw fxError
      }
    }

    return data as Quiniela
  },

  /**
   * Join a quiniela as an authenticated user or as a named guest.
   * Returns the full participant row including guest_token.
   */
  async joinQuiniela(
    quinielaId: string,
    userId: string | null,
    guestName: string | null
  ): Promise<QuinielaParticipant> {
    const { data, error } = await supabase
      .from('quiniela_participants')
      .insert({
        quiniela_id: quinielaId,
        user_id: userId,
        guest_name: guestName,
        total_points: 0,
      })
      .select(`
        *,
        user:users!quiniela_participants_user_id_fkey(id, username, avatar_url, is_admin, created_at)
      `)
      .single()

    if (error) {
      if (error.code === '23505') throw new Error('Already joined this quiniela')
      throw error
    }

    return data as QuinielaParticipant
  },

  /** All participants in a quiniela, sorted by total_points descending. */
  async getParticipants(quinielaId: string): Promise<QuinielaParticipant[]> {
    const [participantsResult, scoreData] = await Promise.all([
      supabase
      .from('quiniela_participants')
      .select(`
        id, quiniela_id, user_id, guest_name, joined_at, total_points,
        user:users!quiniela_participants_user_id_fkey(id, username, avatar_url, is_admin, created_at)
      `)
      .eq('quiniela_id', quinielaId),
      getParticipantScoreAndCountMaps(quinielaId),
    ])

    if (participantsResult.error) throw participantsResult.error

    const participants = ((participantsResult.data as unknown as QuinielaParticipant[]) || []).map((p) => ({
      ...p,
      total_points: scoreData.totalPointsByParticipant.get(p.id) ?? 0,
    }))

    participants.sort((a, b) => b.total_points - a.total_points)
    return participants
  },

  /** Returns true if the given user is already a participant. */
  async isParticipant(quinielaId: string, userId: string | null): Promise<boolean> {
    if (!userId) return false

    const { data, error } = await supabase
      .from('quiniela_participants')
      .select('id')
      .eq('quiniela_id', quinielaId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return !!data
  },

  /**
   * Fetch a participant row by guest_token.
   * Used to restore a guest session from a URL token on a different device.
   * Does NOT return guest_token — the caller already has it from the URL.
   */
  async getParticipantByGuestToken(guestToken: string): Promise<QuinielaParticipant | null> {
    const { data, error } = await supabase
      .from('quiniela_participants')
      .select(`
        id, quiniela_id, user_id, guest_name, joined_at, total_points,
        user:users!quiniela_participants_user_id_fkey(id, username, avatar_url, is_admin, created_at)
      `)
      .eq('guest_token', guestToken)
      .maybeSingle()

    if (error) throw error
    return data as unknown as QuinielaParticipant | null
  },

  /** Fixtures linked to a quiniela via the quiniela_fixtures junction table. */
  async getQuinielaFixtures(quinielaId: string): Promise<FixtureWithTeams[]> {
    const { data, error } = await supabase
      .from('quiniela_fixtures')
      .select(`
        fixture:fixtures!quiniela_fixtures_fixture_id_fkey(
          *,
          home_team:teams!fixtures_home_team_id_fkey(id, name, code, logo_url, group_name, created_at, api_team_id),
          away_team:teams!fixtures_away_team_id_fkey(id, name, code, logo_url, group_name, created_at, api_team_id)
        )
      `)
      .eq('quiniela_id', quinielaId)

    if (error) throw error
    return ((data || []).map((r) => r.fixture).filter(Boolean)) as unknown as FixtureWithTeams[]
  },

  /**
   * Predictions for a quiniela scoped to one participant.
   * Resolves participant_id internally from userId (auth) or guestToken (guest).
   */
  async getUserPredictions(
    quinielaId: string,
    userId: string | null,
    guestToken?: string | null
  ): Promise<QuinielaPrediction[]> {
    const participantId = await resolveParticipantId(quinielaId, userId, guestToken ?? null)
    if (!participantId) return []

    const { data, error } = await supabase
      .from('quiniela_predictions')
      .select('*')
      .eq('quiniela_id', quinielaId)
      .eq('participant_id', participantId)

    if (error) throw error
    return (data as QuinielaPrediction[]) || []
  },

  /**
   * Upsert a prediction.
   * Resolves participant_id internally from userId (auth) or guestToken (guest).
   * The participant must have already joined the quiniela.
   */
  async makePrediction(
    userId: string | null,
    guestToken: string | null,
    input: MakePredictionInput
  ): Promise<QuinielaPrediction> {
    const participantId = await resolveParticipantId(input.quiniela_id, userId, guestToken)
    if (!participantId) {
      throw new Error('You must join this quiniela before making predictions')
    }

    const { data, error } = await supabase
      .from('quiniela_predictions')
      .upsert(
        {
          quiniela_id: input.quiniela_id,
          user_id: userId,
          participant_id: participantId,
          fixture_id: input.fixture_id,
          predicted_home_score: input.predicted_home_score,
          predicted_away_score: input.predicted_away_score,
          points_earned: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'quiniela_id,participant_id,fixture_id' }
      )
      .select()
      .single()

    if (error) throw error
    return data as QuinielaPrediction
  },

  /**
   * Leaderboard for a quiniela.
   * Participants sorted by total_points DESC; prediction counts joined in TypeScript.
   */
  async getLeaderboard(quinielaId: string): Promise<LeaderboardEntry[]> {
    const [participantsResult, scoreData] = await Promise.all([
      supabase
        .from('quiniela_participants')
        .select(`
          id,
          quiniela_id,
          user_id,
          guest_name,
          total_points,
          user:users!quiniela_participants_user_id_fkey(id, username, avatar_url, is_admin, created_at)
        `)
        .eq('quiniela_id', quinielaId),
      getParticipantScoreAndCountMaps(quinielaId),
    ])

    if (participantsResult.error) throw participantsResult.error

    const sortedParticipants = [...(participantsResult.data || [])].sort((a, b) => {
      const aPoints = scoreData.totalPointsByParticipant.get(a.id as string) ?? 0
      const bPoints = scoreData.totalPointsByParticipant.get(b.id as string) ?? 0
      return bPoints - aPoints
    })

    return sortedParticipants.map((p, index) => ({
      id: p.id as string,
      quiniela_id: p.quiniela_id as string,
      user_id: p.user_id as string | null,
      guest_name: p.guest_name as string | null,
      user: p.user as unknown as User | undefined,
      total_points: scoreData.totalPointsByParticipant.get(p.id as string) ?? 0,
      predictions_count: scoreData.predictionCountByParticipant.get(p.id as string) ?? 0,
      rank: index + 1,
    }))
  },

  /** Delete a quiniela. RLS on the DB enforces creator-only access. */
  async deleteQuiniela(quinielaId: string, _userId: string): Promise<void> {
    const { error } = await supabase.from('quinielas').delete().eq('id', quinielaId)
    if (error) throw error
  },
}
