import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { t } = useTranslation()

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
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/news" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              {t('nav.news')}
            </Link>
            <Link to="/fixtures" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              {t('nav.fixtures')}
            </Link>
            <Link to="/standings" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              {t('nav.standings')}
            </Link>
            <Link to="/quinielas" className="font-body font-semibold uppercase tracking-wide text-sm hover:underline">
              {t('nav.quinielas')}
            </Link>
            
            <LanguageSelector />
            
            {user ? (
              <Link 
                to="/profile" 
                className="px-6 py-2 bg-raw-black text-raw-white border-thick border-raw-black uppercase text-sm font-semibold tracking-wider hover:bg-raw-white hover:text-raw-black transition-colors"
              >
                {user.user_metadata?.username || t('nav.profile')}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="px-6 py-2 bg-raw-black text-raw-white border-thick border-raw-black uppercase text-sm font-semibold tracking-wider hover:bg-raw-white hover:text-raw-black transition-colors"
              >
                {t('nav.login')}
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
              {t('nav.news')}
            </Link>
            <Link to="/fixtures" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              {t('nav.fixtures')}
            </Link>
            <Link to="/standings" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              {t('nav.standings')}
            </Link>
            <Link to="/quinielas" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
              {t('nav.quinielas')}
            </Link>
            
            <div className="px-4 py-2">
              <LanguageSelector />
            </div>
            
            {user ? (
              <Link to="/profile" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
                {user.user_metadata?.username || t('nav.profile')}
              </Link>
            ) : (
              <>
                <Link to="/login" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="block py-2 font-body font-semibold uppercase tracking-wide text-sm hover:bg-raw-black hover:text-raw-white px-4">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
