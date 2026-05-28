import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCreateQuiniela } from '@/hooks/useQuinielas'
import { useFixtures } from '@/hooks/useFixtures'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import type { CreateQuinielaInput } from '@/types/database'

export default function CreateQuiniela() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: fixtures, isLoading: loadingFixtures } = useFixtures()
  const createQuiniela = useCreateQuiniela()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    matchSelection: 'group-stage' as 'group-stage' | 'knockout' | 'all',
  })

  const [error, setError] = useState('')

  // Calculate deadline based on selection
  const getDeadline = () => {
    if (!fixtures || fixtures.length === 0) return new Date().toISOString()
    
    // Get the first match date based on selection
    let firstMatch = fixtures[0]
    if (formData.matchSelection === 'knockout') {
      // Round of 16 starts around match 49
      firstMatch = fixtures.find(f => f.round === 'Round of 16') || fixtures[0]
    }
    
    // Deadline is 1 hour before first match
    const deadline = new Date(firstMatch.match_date)
    deadline.setHours(deadline.getHours() - 1)
    return deadline.toISOString()
  }

  // Get fixture IDs based on selection
  const getFixtureIds = () => {
    if (!fixtures) return []
    
    switch (formData.matchSelection) {
      case 'group-stage':
        return fixtures
          .filter(f => f.round === 'Group Stage')
          .map(f => f.id)
          .slice(0, 48) // First 48 matches are group stage
      case 'knockout':
        return fixtures
          .filter(f => f.round !== 'Group Stage')
          .map(f => f.id)
      case 'all':
        return fixtures.map(f => f.id)
      default:
        return []
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in to create a quiniela')
      return
    }

    if (formData.name.length < 3) {
      setError('Quiniela name must be at least 3 characters')
      return
    }

    const fixtureIds = getFixtureIds()
    if (fixtureIds.length === 0) {
      setError('No fixtures available for the selected option')
      return
    }

    const input: CreateQuinielaInput = {
      name: formData.name,
      description: formData.description || undefined,
      is_public: formData.is_public,
      deadline: getDeadline(),
      fixture_ids: fixtureIds,
    }

    try {
      const newQuiniela = await createQuiniela.mutateAsync({
        userId: user.id,
        input,
      })
      
      // Navigate to the new quiniela
      navigate(`/quinielas/${newQuiniela.share_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiniela')
    }
  }

  const getMatchCount = () => {
    switch (formData.matchSelection) {
      case 'group-stage':
        return 48
      case 'knockout':
        return 16
      case 'all':
        return 64
      default:
        return 0
    }
  }

  if (loadingFixtures) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-raw-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-4xl sm:text-5xl uppercase mb-4">
            CREATE QUINIELA
          </h1>
          <p className="text-gray-700 text-lg">
            Set up your prediction pool and invite friends to compete!
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-semibold mb-2 uppercase text-sm">
                Quiniela Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Office World Cup Pool"
                required
                maxLength={100}
              />
              <p className="text-sm text-gray-600 mt-1">
                Give your quiniela a memorable name
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block font-semibold mb-2 uppercase text-sm">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about your quiniela, rules, prizes, etc."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-600 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Match Selection */}
            <div>
              <label className="block font-semibold mb-3 uppercase text-sm">
                Which Matches? *
              </label>
              <div className="space-y-3">
                <Radio
                  name="matchSelection"
                  value="group-stage"
                  checked={formData.matchSelection === 'group-stage'}
                  onChange={() => setFormData({ ...formData, matchSelection: 'group-stage' })}
                  label="Group Stage Only (48 matches)"
                />
                <Radio
                  name="matchSelection"
                  value="knockout"
                  checked={formData.matchSelection === 'knockout'}
                  onChange={() => setFormData({ ...formData, matchSelection: 'knockout' })}
                  label="Knockout Stage Only (16 matches)"
                />
                <Radio
                  name="matchSelection"
                  value="all"
                  checked={formData.matchSelection === 'all'}
                  onChange={() => setFormData({ ...formData, matchSelection: 'all' })}
                  label="All Matches (64 matches)"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Participants will predict {getMatchCount()} matches
              </p>
            </div>

            {/* Privacy */}
            <div className="border-t-3 border-gray-200 pt-6">
              <label className="block font-semibold mb-3 uppercase text-sm">
                Privacy Settings
              </label>
              <div className="space-y-3">
                <Checkbox
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  label="Make this quiniela public"
                />
                <p className="text-sm text-gray-600 ml-7">
                  {formData.is_public
                    ? 'Anyone can discover and join this quiniela'
                    : 'Only people with the share code can join'}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-thick border-blue-600 p-6">
              <h3 className="font-headline text-lg uppercase mb-2">WHAT HAPPENS NEXT?</h3>
              <ul className="space-y-2 text-sm text-gray-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>You'll get a unique share code to invite participants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Predictions must be made before the deadline (1 hour before first match)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Points are awarded automatically after each match finishes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Track progress on the live leaderboard</span>
                </li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-thick border-red-600 p-4">
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                size="large"
                disabled={createQuiniela.isPending}
                className="flex-1"
              >
                {createQuiniela.isPending ? 'CREATING...' : 'CREATE QUINIELA'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={() => navigate('/quinielas')}
                disabled={createQuiniela.isPending}
              >
                CANCEL
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
