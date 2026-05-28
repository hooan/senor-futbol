import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicQuinielas } from '@/hooks/useQuinielas'
import { useAuth } from '@/contexts/AuthContext'
import QuinielaCard from '@/components/quinielas/QuinielaCard'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import Input from '@/components/ui/Input'

export default function Quinielas() {
  const { data: quinielas, isLoading } = usePublicQuinielas()
  const { user } = useAuth()
  const [shareCodeInput, setShareCodeInput] = useState('')

  const handleJoinByCode = () => {
    if (shareCodeInput.trim()) {
      window.location.href = `/quinielas/${shareCodeInput.trim().toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Hero Section */}
      <div className="bg-raw-black text-raw-white py-16 border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl sm:text-6xl uppercase mb-4">QUINIELAS</h1>
            <p className="font-body text-lg sm:text-xl mb-8 text-gray-300">
              Create or join prediction pools with friends, family, or the community. Compete to see
              who can predict the World Cup 2026 matches best!
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/quinielas/create">
                  <Button variant="secondary" size="large">
                    CREATE QUINIELA
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" size="large">
                    LOGIN TO CREATE
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Join by Code Section */}
        <div className="mb-12 bg-gray-50 border-thick border-gray-900 p-6 sm:p-8">
          <h2 className="font-headline text-2xl uppercase mb-4">JOIN BY SHARE CODE</h2>
          <p className="text-gray-700 mb-6">
            Got a share code from a friend? Enter it below to join their quiniela.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter share code (e.g., OFFICE2026)"
                value={shareCodeInput}
                onChange={(e) => setShareCodeInput(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                maxLength={10}
              />
            </div>
            <Button onClick={handleJoinByCode} disabled={!shareCodeInput.trim()}>
              JOIN QUINIELA
            </Button>
          </div>
        </div>

        {/* Public Quinielas List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-3xl uppercase">PUBLIC QUINIELAS</h2>
            <span className="text-sm text-gray-600 font-mono">
              {quinielas?.length || 0} available
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loading />
            </div>
          ) : !quinielas || quinielas.length === 0 ? (
            <div className="text-center py-16 border-thick border-gray-300 bg-gray-50">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={3}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-headline text-xl uppercase mb-2">NO PUBLIC QUINIELAS YET</h3>
              <p className="text-gray-600 mb-6">Be the first to create a public quiniela!</p>
              {user ? (
                <Link to="/quinielas/create">
                  <Button>CREATE QUINIELA</Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button>LOGIN TO CREATE</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quinielas.map((quiniela) => (
                <QuinielaCard key={quiniela.id} quiniela={quiniela} />
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-16 border-t-thick border-gray-300 pt-16">
          <h2 className="font-headline text-3xl uppercase mb-8 text-center">HOW IT WORKS</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-raw-black text-raw-white font-headline text-3xl flex items-center justify-center mx-auto mb-4 border-thick border-raw-black">
                1
              </div>
              <h3 className="font-headline text-xl uppercase mb-2">CREATE OR JOIN</h3>
              <p className="text-gray-700">
                Create your own quiniela or join an existing one using a share code.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-raw-black text-raw-white font-headline text-3xl flex items-center justify-center mx-auto mb-4 border-thick border-raw-black">
                2
              </div>
              <h3 className="font-headline text-xl uppercase mb-2">MAKE PREDICTIONS</h3>
              <p className="text-gray-700">
                Predict the scores for matches before the deadline. Update anytime before kickoff.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-raw-black text-raw-white font-headline text-3xl flex items-center justify-center mx-auto mb-4 border-thick border-raw-black">
                3
              </div>
              <h3 className="font-headline text-xl uppercase mb-2">COMPETE & WIN</h3>
              <p className="text-gray-700">
                Earn points for accurate predictions and climb the leaderboard to claim victory!
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Rules */}
        <div className="mt-16 bg-yellow-50 border-thick border-yellow-600 p-6 sm:p-8">
          <h3 className="font-headline text-2xl uppercase mb-4">SCORING RULES</h3>
          <div className="space-y-3 font-body">
            <div className="flex items-start gap-3">
              <span className="font-headline text-2xl text-yellow-600">5</span>
              <div>
                <strong className="font-semibold">Exact Score:</strong> You predicted the exact
                final score (e.g., 2-1)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-headline text-2xl text-yellow-600">3</span>
              <div>
                <strong className="font-semibold">Correct Result:</strong> You predicted the winner
                or draw correctly
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-headline text-2xl text-yellow-600">1</span>
              <div>
                <strong className="font-semibold">Correct Goal Difference:</strong> You got the goal
                difference right
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
