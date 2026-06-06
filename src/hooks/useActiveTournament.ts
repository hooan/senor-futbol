import { useState, useEffect } from 'react'
import { useTournaments } from './useTournaments'
import { useFeatureFlags } from './useFeatureFlags'
import type { Tournament } from '@/types/database'

const TOURNAMENT_STORAGE_KEY = 'selected_tournament_id'

export function useActiveTournament() {
  const { data: flags, isLoading: isFlagsLoading } = useFeatureFlags()
  const { data: tournaments, isLoading } = useTournaments()
  const [activeTournamentId, setActiveTournamentIdState] = useState<string | null>(null)
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null)
  const multiTournamentEnabled = flags?.multiTournamentEnabled ?? false

  // Initialize from localStorage or default to most recent tournament
  useEffect(() => {
    if (isFlagsLoading || isLoading || !tournaments || tournaments.length === 0) return

    if (!multiTournamentEnabled) {
      setActiveTournamentIdState(tournaments[0].id)
      localStorage.removeItem(TOURNAMENT_STORAGE_KEY)
      return
    }

    const stored = localStorage.getItem(TOURNAMENT_STORAGE_KEY)
    
    if (stored && tournaments.find((t) => t.id === stored)) {
      // Use stored tournament if it exists
      setActiveTournamentIdState(stored)
    } else {
      // Default to most recent tournament (first in list, already sorted by season DESC)
      setActiveTournamentIdState(tournaments[0].id)
    }
  }, [tournaments, isLoading, isFlagsLoading, multiTournamentEnabled])

  // Update active tournament object when ID changes
  useEffect(() => {
    if (!activeTournamentId || !tournaments) {
      setActiveTournament(null)
      return
    }

    const tournament = tournaments.find((t) => t.id === activeTournamentId)
    setActiveTournament(tournament || null)
  }, [activeTournamentId, tournaments])

  // Set active tournament and persist to localStorage
  const setActiveTournamentId = (tournamentId: string) => {
    if (!multiTournamentEnabled) {
      return
    }

    setActiveTournamentIdState(tournamentId)
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, tournamentId)
  }

  return {
    activeTournament,
    activeTournamentId,
    setActiveTournamentId,
    tournaments: tournaments || [],
    multiTournamentEnabled,
    isLoading: isLoading || isFlagsLoading,
  }
}
