// Mock Data Service
// This service simulates API calls and will be easy to replace with real Supabase calls later

import {
  getFixturesWithTeams,
  getTodayFixtures,
  getUpcomingFixtures,
  getFinishedFixtures,
  getFixturesByGroup,
  getFixturesByRound,
} from '@/data/mockFixtures'

import {
  getStandingsWithTeams,
  getStandingsByGroup,
  getAllGroupStandings,
  getQualifiedTeams,
} from '@/data/mockStandings'

import {
  getNewsWithAuthor,
  getPublishedNews,
  getNewsById,
  getLatestNews,
} from '@/data/mockNews'

import { mockTeams } from '@/data/mockTeams'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Fixtures Service
export const fixturesService = {
  async getAll() {
    await delay(300)
    return getFixturesWithTeams()
  },

  async getToday() {
    await delay(200)
    return getTodayFixtures()
  },

  async getUpcoming(limit = 10) {
    await delay(200)
    return getUpcomingFixtures(limit)
  },

  async getFinished(limit = 10) {
    await delay(200)
    return getFinishedFixtures(limit)
  },

  async getByGroup(group: string) {
    await delay(200)
    return getFixturesByGroup(group)
  },

  async getByRound(round: string) {
    await delay(200)
    return getFixturesByRound(round)
  },

  async getById(id: string) {
    await delay(200)
    const fixtures = getFixturesWithTeams()
    return fixtures.find(f => f.id === id)
  },
}

// Standings Service
export const standingsService = {
  async getAll() {
    await delay(300)
    return getStandingsWithTeams()
  },

  async getByGroup(group: string) {
    await delay(200)
    return getStandingsByGroup(group)
  },

  async getAllGroups() {
    await delay(300)
    return getAllGroupStandings()
  },

  async getQualified() {
    await delay(200)
    return getQualifiedTeams()
  },
}

// News Service
export const newsService = {
  async getAll() {
    await delay(300)
    return getNewsWithAuthor()
  },

  async getPublished() {
    await delay(300)
    return getPublishedNews()
  },

  async getById(id: string) {
    await delay(200)
    return getNewsById(id)
  },

  async getLatest(limit = 5) {
    await delay(200)
    return getLatestNews(limit)
  },
}

// Teams Service
export const teamsService = {
  async getAll() {
    await delay(200)
    return mockTeams
  },

  async getById(id: string) {
    await delay(100)
    return mockTeams.find(t => t.id === id)
  },
}

// Export all services
export const mockDataService = {
  fixtures: fixturesService,
  standings: standingsService,
  news: newsService,
  teams: teamsService,
}
