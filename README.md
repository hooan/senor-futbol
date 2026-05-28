# Señor Fútbol - FIFA World Cup 2026

A brutalist-styled web application for FIFA World Cup 2026 featuring news, standings, fixtures, results, and a quinielas (betting pools) system.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS (RawBlock Design System - Brutalist)
- **Package Manager**: pnpm
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel
- **API**: API-Football v3 (optimized for 100 requests/day free tier)

## Features

### Core Features
- **News Section**: Admin-created news articles about World Cup 2026
- **Fixtures**: Today's matches, upcoming fixtures, and results
- **Standings**: Group stage tables with live updates
- **Quinielas System**: 
  - Create prediction pools (logged users)
  - Share with public (guests can participate with a name)
  - Advanced scoring: Exact score (5pts), Correct result (3pts), Correct goal difference (1pt)
  - Real-time leaderboards

### Admin Panel
- News management (CRUD)
- API usage monitoring
- User management

## Getting Started

### Prerequisites

- Node.js 20+ (or Node 21.7.3)
- pnpm 10+
- Supabase account (free tier)
- API-Football account (optional, for future integration)

### Installation

1. **Clone the repository**
   ```bash
   cd senor-futbol
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Supabase**
   
   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run the database schema:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-schema.sql`
   - Execute the SQL to create all tables, policies, and functions
   
   c. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the `Project URL` and `anon/public` key

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm preview
```

## Project Structure

```
senor-futbol/
├── src/
│   ├── components/
│   │   ├── ui/              # RawBlock design system components
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── news/            # News components
│   │   ├── fixtures/        # Fixture components
│   │   ├── standings/       # Standings components
│   │   ├── quinielas/       # Quiniela components
│   │   └── admin/           # Admin components
│   ├── pages/               # Route pages
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── lib/                 # Utilities and configs
│   ├── types/               # TypeScript types
│   ├── data/                # Mock data (for development)
│   └── contexts/            # React contexts
├── api/                     # Vercel serverless functions
├── supabase-schema.sql      # Database schema
├── DESIGN.md                # RawBlock design system documentation
└── package.json
```

## Design System: RawBlock

This project uses the **RawBlock** design system - a brutalist, anti-design approach featuring:

- **Zero border radius** - All elements are square
- **No shadows** - Visual hierarchy through thick borders (3px, 5px)
- **Black and white** primary colors
- **Blue links only** - Reserved for hyperlinks
- **Thick borders** as the primary visual organizer
- **Fonts**: Archivo Black (headlines), Work Sans (body), Space Mono (mono)

See `DESIGN.md` for complete design guidelines.

## API Optimization Strategy

To stay within the 100 requests/day limit of API-Football's free tier:

1. **Caching**: All API responses cached in Supabase
2. **Smart Updates**: 
   - Fixtures: Once per day
   - Standings: Once per day after matches
   - Live matches: Only during match days, every 5-10 minutes
3. **Vercel Cron Jobs**: Scheduled updates at optimal times
4. **Database-First**: Serve from database, not API

**Current Mode**: Uses mock data. Real API integration ready for when World Cup 2026 fixtures are available.

## Database Schema

### Main Tables
- `teams` - World Cup teams
- `fixtures` - Matches/fixtures
- `standings` - Group stage standings
- `news` - News articles (admin-created)
- `quinielas` - Prediction pools
- `quiniela_predictions` - Individual predictions
- `quiniela_participants` - Users and guests in quinielas
- `api_request_log` - API usage tracking

### Scoring Function
The database includes a `calculate_prediction_points()` function that implements the advanced scoring system:
- Exact score: 5 points
- Correct result: 3 points
- Correct goal difference: 1 point

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Add `VITE_API_FOOTBALL_KEY` (when ready)

4. **Setup Cron Jobs** (in `vercel.json`)
   - Daily fixture updates
   - Daily standings updates

## Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Tailwind + RawBlock configuration
- [x] Supabase schema
- [x] Basic layout and routing

### Phase 2: UI Components (Next)
- [ ] RawBlock component library (Button, Card, Input, etc.)
- [ ] Responsive navigation
- [ ] Loading states

### Phase 3: Mock Data & Types
- [ ] Mock teams, fixtures, standings
- [ ] TypeScript interfaces
- [ ] Seed Supabase with mock data

### Phase 4: Core Features
- [ ] Fixtures page (today, upcoming, results)
- [ ] Standings page
- [ ] News section

### Phase 5: Authentication
- [ ] Login/Register
- [ ] User profiles
- [ ] Admin role system

### Phase 6: Quinielas
- [ ] Create quiniela
- [ ] Make predictions
- [ ] Leaderboard
- [ ] Guest participation

### Phase 7: Admin Panel
- [ ] News management
- [ ] API monitoring
- [ ] User management

### Phase 8: Polish
- [ ] Mobile optimization
- [ ] Error handling
- [ ] Performance optimization
- [ ] SEO

### Future: API Integration
- [ ] Integrate real API-Football data when World Cup 2026 fixtures available
- [ ] Activate Vercel cron jobs
- [ ] Live match updates

## Contributing

This is a portfolio/demonstration project. Feel free to fork and customize!

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ⚫⚪ RawBlock Design System**
