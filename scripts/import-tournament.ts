#!/usr/bin/env node

/**
 * Tournament Import CLI Tool
 * 
 * Usage:
 *   pnpm import-tournament <leagueId> <season> [options]
 * 
 * Examples:
 *   pnpm import-tournament 22 2023
 *   pnpm import-tournament 22 2021 --name "Gold Cup 2021"
 *   pnpm import-tournament 22 2023 --dry-run
 */

import { DataSyncService } from '../src/services/dataSync'
import { apiFootball } from '../src/services/apiFootball'

// Parse command line arguments
const args = process.argv.slice(2)

function printHelp() {
  console.log(`
🏆 Tournament Import Tool

Usage:
  pnpm import-tournament <leagueId> <season> [options]

Arguments:
  leagueId    API-Football league ID (e.g., 22 for CONCACAF Gold Cup)
  season      Tournament season year (e.g., 2023)

Options:
  --name "..."    Custom tournament name
  --dry-run       Preview without importing to database
  --help          Show this help message

Examples:
  pnpm import-tournament 22 2023
  pnpm import-tournament 22 2021 --name "Gold Cup 2021"
  pnpm import-tournament 22 2023 --dry-run

Available Tournaments (Free Tier):
  22  - CONCACAF Gold Cup (2021, 2023)
  536 - CONCACAF Nations League (2019, 2022, 2024)
  31  - World Cup Qualification CONCACAF (2022)

For more information, see IMPORT_TOURNAMENT_GUIDE.md
`)
}

function printHeader(title: string) {
  console.log(`\n🏆 ${title}`)
  console.log('━'.repeat(60))
}

function printStep(step: number, total: number, message: string) {
  console.log(`\n[${step}/${total}] ${message}`)
}

function printSuccess(message: string) {
  console.log(`✓ ${message}`)
}

function printError(message: string) {
  console.log(`❌ ${message}`)
}

function printWarning(message: string) {
  console.log(`⚠️  ${message}`)
}

function printInfo(message: string) {
  console.log(`  • ${message}`)
}

async function main() {
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  // Parse arguments
  const leagueId = parseInt(args[0])
  const season = parseInt(args[1])
  const dryRun = args.includes('--dry-run')
  
  const nameIndex = args.indexOf('--name')
  const customName = nameIndex !== -1 ? args[nameIndex + 1] : undefined

  // Validate arguments
  if (!leagueId || !season || isNaN(leagueId) || isNaN(season)) {
    printError('Missing or invalid arguments')
    console.log('\nUsage: pnpm import-tournament <leagueId> <season>')
    console.log('Run "pnpm import-tournament --help" for more information')
    process.exit(1)
  }

  if (season < 2008 || season > 2027) {
    printError(`Invalid season: ${season}. Must be between 2008-2027`)
    process.exit(1)
  }

  try {
    printHeader(dryRun ? 'Tournament Import (DRY RUN)' : 'Tournament Import')

    const syncService = new DataSyncService()

    // Step 1: Fetch tournament info
    printStep(1, 5, 'Fetching tournament info...')
    
    const league = await apiFootball.getLeague(leagueId)
    
    if (!league) {
      throw new Error(`League ${leagueId} not found`)
    }

    printSuccess(`League: ${league.league.name} (ID: ${leagueId})`)
    printSuccess(`Season: ${season}`)
    printSuccess(`Type: ${league.league.type}`)

    // Check if season is available
    const availableSeasons = league.seasons.map(s => s.year)
    if (!availableSeasons.includes(season)) {
      printWarning(`Season ${season} not in available seasons: ${availableSeasons.join(', ')}`)
      printWarning('Continuing anyway, but import may fail')
    }

    // Step 2: Fetch fixtures
    printStep(2, 5, 'Fetching fixtures from API-Football...')
    
    const fixtures = await apiFootball.getFixturesByLeague(leagueId, season)
    
    if (fixtures.length === 0) {
      throw new Error(`No fixtures found for league ${leagueId}, season ${season}`)
    }

    printSuccess(`Found ${fixtures.length} fixtures`)
    printInfo(`First match: ${new Date(fixtures[0].fixture.date).toLocaleDateString()}`)
    printInfo(`Last match: ${new Date(fixtures[fixtures.length - 1].fixture.date).toLocaleDateString()}`)

    // Step 3: Extract teams
    printStep(3, 5, 'Extracting teams from fixtures...')
    
    const uniqueTeams = new Set<string>()
    fixtures.forEach(f => {
      uniqueTeams.add(f.teams.home.name)
      uniqueTeams.add(f.teams.away.name)
    })

    printSuccess(`Found ${uniqueTeams.size} unique teams`)
    const teamList = Array.from(uniqueTeams).slice(0, 8)
    teamList.forEach(team => printInfo(team))
    if (uniqueTeams.size > 8) {
      printInfo(`... and ${uniqueTeams.size - 8} more`)
    }

    // Check rate limit
    const remaining = apiFootball.getRemainingRequests()
    printInfo(`API requests: ${apiFootball.getRequestCount()}/100 used today (${remaining} remaining)`)

    if (remaining < 10) {
      printWarning('API rate limit approaching! Be cautious.')
    }

    // If dry run, stop here
    if (dryRun) {
      console.log('\n' + '━'.repeat(60))
      console.log('✅ Dry run complete - no data imported')
      console.log('\nTo import for real, run without --dry-run flag:')
      console.log(`  pnpm import-tournament ${leagueId} ${season}`)
      process.exit(0)
    }

    // Step 4: Import to database
    printStep(4, 5, 'Importing to Supabase database...')
    printInfo('This may take a moment...')

    const result = await syncService.syncTournament(leagueId, season, customName)

    if (!result.success) {
      throw new Error(`Import failed: ${result.errors.join(', ')}`)
    }

    printSuccess(`Tournament created: ${result.tournament?.name}`)
    printSuccess(`Imported ${result.teamsImported} teams`)
    printSuccess(`Imported ${result.fixturesImported} fixtures`)
    printSuccess(`Calculated ${result.standingsImported} standings`)

    // Step 5: Verify
    printStep(5, 5, 'Verifying import...')
    
    const tournaments = await syncService.getAllTournaments()
    printSuccess(`Total tournaments in database: ${tournaments.length}`)
    printSuccess(`Active tournament: ${result.tournament?.name}`)

    // Print summary
    console.log('\n' + '━'.repeat(60))
    console.log('✅ Import Complete!\n')
    console.log('Summary:')
    console.log(`  📊 Teams:        ${result.teamsImported} imported`)
    console.log(`  ⚽ Fixtures:     ${result.fixturesImported} imported`)
    console.log(`  🏆 Standings:    ${result.standingsImported} calculated`)
    console.log(`  📡 API Requests: ${result.apiRequestsUsed} used (${apiFootball.getRemainingRequests()} remaining today)`)
    
    if (result.tournament) {
      console.log(`  🆔 Tournament ID: ${result.tournament.id}`)
    }

    console.log('\nNext Steps:')
    console.log('  1. Start dev server: pnpm dev')
    console.log('  2. Visit: http://localhost:3000/fixtures')
    console.log('  3. Create a quiniela with real tournament data')
    console.log('  4. Test predictions and scoring')

    console.log('\n' + '━'.repeat(60))

  } catch (error) {
    console.log('\n' + '━'.repeat(60))
    printError('Import failed!')
    console.log('\nError:', error instanceof Error ? error.message : String(error))
    
    console.log('\nTroubleshooting:')
    console.log('  • Check your API key in .env.local')
    console.log('  • Verify league ID and season are correct')
    console.log('  • Check API rate limit (100 requests/day)')
    console.log('  • Run with --dry-run to preview before importing')
    console.log('\nFor more help, see IMPORT_TOURNAMENT_GUIDE.md')
    
    process.exit(1)
  }
}

// Run
main()
