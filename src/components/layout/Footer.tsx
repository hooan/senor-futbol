import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-raw-black text-raw-white border-t-thick border-raw-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-headline text-2xl mb-4 uppercase tracking-wider">
              SEÑOR FÚTBOL
            </h3>
            <p className="font-body text-sm leading-relaxed">
              FIFA World Cup 2026 news, fixtures, standings, and quinielas.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-wider mb-4">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/news" className="text-raw-white hover:underline">
                  News
                </Link>
              </li>
              <li>
                <Link to="/fixtures" className="text-raw-white hover:underline">
                  Fixtures
                </Link>
              </li>
              <li>
                <Link to="/standings" className="text-raw-white hover:underline">
                  Standings
                </Link>
              </li>
              <li>
                <Link to="/quinielas" className="text-raw-white hover:underline">
                  Quinielas
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-wider mb-4">
              ABOUT
            </h4>
            <p className="font-body text-sm leading-relaxed">
              Powered by API-Football. Data cached and optimized for performance.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-thin border-raw-white">
          <p className="font-mono text-xs text-center">
            &copy; {currentYear} SEÑOR FÚTBOL. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}
