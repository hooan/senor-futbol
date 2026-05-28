import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="bg-raw-white border-b-thick border-raw-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 no-underline hover:no-underline">
            <h1 className="font-headline text-3xl tracking-wider uppercase text-raw-black">
              SEÑOR FÚTBOL
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/news" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              NEWS
            </Link>
            <Link to="/fixtures" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              FIXTURES
            </Link>
            <Link to="/standings" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              STANDINGS
            </Link>
            <Link to="/quinielas" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              QUINIELAS
            </Link>
            {user ? (
              <Link 
                to="/profile" 
                className="px-6 py-2 bg-raw-black text-raw-white border-thick border-raw-black uppercase text-sm font-semibold tracking-wider hover:bg-raw-white hover:text-raw-black transition-colors"
              >
                {user.user_metadata?.username || 'PROFILE'}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="px-6 py-2 bg-raw-black text-raw-white border-thick border-raw-black uppercase text-sm font-semibold tracking-wider hover:bg-raw-white hover:text-raw-black transition-colors"
              >
                LOGIN
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-thick border-raw-black bg-raw-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-raw-black mb-1"></div>
            <div className="w-6 h-0.5 bg-raw-black mb-1"></div>
            <div className="w-6 h-0.5 bg-raw-black"></div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t-thick border-raw-black">
            <Link to="/news" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              NEWS
            </Link>
            <Link to="/fixtures" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              FIXTURES
            </Link>
            <Link to="/standings" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              STANDINGS
            </Link>
            <Link to="/quinielas" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              QUINIELAS
            </Link>
            {user ? (
              <Link to="/profile" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
                {user.user_metadata?.username || 'PROFILE'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
                  LOGIN
                </Link>
                <Link to="/register" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
                  REGISTER
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
