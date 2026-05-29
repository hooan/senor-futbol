import { useState, useEffect } from 'react'
import { useTournaments } from './useTournaments'
import type { Tournament } from '@/types/database'

const TOURNAMENT_STORAGE_KEY = 'selected_tournament_id'

export function useActiveTournament() {
  const { data: tournaments, isLoading } = useTournaments()
  const [activeTournamentId, setActiveTournamentIdState] = useState<string | null>(null)
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null)

  // Initialize from localStorage or default to most recent tournament
  useEffect(() => {
    if (isLoading || !tournaments || tournaments.length === 0) return

    const stored = localStorage.getItem(TOURNAMENT_STORAGE_KEY)
    
    if (stored && tournaments.find((t) => t.id === stored)) {
      // Use stored tournament if it exists
      setActiveTournamentIdState(stored)
    } else {
      // Default to most recent tournament (first in list, already sorted by season DESC)
      setActiveTournamentIdState(tournaments[0].id)
    }
  }, [tournaments, isLoading])

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
    setActiveTournamentIdState(tournamentId)
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, tournamentId)
  }

  return {
    activeTournament,
    activeTournamentId,
    setActiveTournamentId,
    tournaments: tournaments || [],
    isLoading,
  }
}
