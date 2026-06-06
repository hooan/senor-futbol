import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useCreateQuiniela } from '@/hooks/useQuinielas'
import { useFixtures } from '@/hooks/useFixtures'
import { useActiveTournament } from '@/hooks/useActiveTournament'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import type { CreateQuinielaInput } from '@/types/database'

export default function CreateQuiniela() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeTournamentId } = useActiveTournament()
  const { data: fixtures, isLoading: loadingFixtures } = useFixtures(activeTournamentId || undefined)
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
      firstMatch =
        fixtures.find((f) => f.round === 'Round of 32') ||
        fixtures.find((f) => f.round === 'Round of 16') ||
        fixtures[0]
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
      setError(t('quinielas.mustBeLoggedIn'))
      return
    }

    if (formData.name.length < 3) {
      setError(t('quinielas.nameMinLength', { count: 3 }))
      return
    }

    const fixtureIds = getFixtureIds()
    if (fixtureIds.length === 0) {
      setError(t('quinielas.noFixturesAvailable'))
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
      setError(err instanceof Error ? err.message : t('quinielas.failedToSavePrediction'))
    }
  }

  const getMatchCount = () => {
    if (!fixtures) return 0

    switch (formData.matchSelection) {
      case 'group-stage':
        return fixtures.filter((f) => f.round === 'Group Stage').length
      case 'knockout':
        return fixtures.filter((f) => f.round !== 'Group Stage').length
      case 'all':
        return fixtures.length
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
            {t('quinielas.createQuinielaTitle').toUpperCase()}
          </h1>
          <p className="text-gray-700 text-lg">
            {t('quinielas.createQuinielaSubtitle')}
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-semibold mb-2 uppercase text-sm">
                {t('quinielas.quinielaName')} *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('quinielas.quinielaNamePlaceholder')}
                required
                maxLength={100}
              />
              <p className="text-sm text-gray-600 mt-1">
                {t('quinielas.quinielaNameHelper')}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block font-semibold mb-2 uppercase text-sm">
                {t('quinielas.descriptionOptional')}
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('quinielas.descriptionPlaceholder')}
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-600 mt-1">
                {formData.description.length}/500 {t('validation.maxLength', { count: 500 }).toLowerCase()}
              </p>
            </div>

            {/* Match Selection */}
            <div>
              <label className="block font-semibold mb-3 uppercase text-sm">
                {t('quinielas.whichMatches')} *
              </label>
              <div className="space-y-3">
                <Radio
                  name="matchSelection"
                  value="group-stage"
                  checked={formData.matchSelection === 'group-stage'}
                  onChange={() => setFormData({ ...formData, matchSelection: 'group-stage' })}
                  label={t('quinielas.groupStageOnly')}
                />
                <Radio
                  name="matchSelection"
                  value="knockout"
                  checked={formData.matchSelection === 'knockout'}
                  onChange={() => setFormData({ ...formData, matchSelection: 'knockout' })}
                  label={t('quinielas.knockoutStageOnly')}
                />
                <Radio
                  name="matchSelection"
                  value="all"
                  checked={formData.matchSelection === 'all'}
                  onChange={() => setFormData({ ...formData, matchSelection: 'all' })}
                  label={t('quinielas.allMatches')}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {t('quinielas.participantsWillPredict', { count: getMatchCount() })}
              </p>
            </div>

            {/* Privacy */}
            <div className="border-t-3 border-gray-200 pt-6">
              <label className="block font-semibold mb-3 uppercase text-sm">
                {t('quinielas.privacySettings')}
              </label>
              <div className="space-y-3">
                <Checkbox
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  label={t('quinielas.makePublic')}
                />
                <p className="text-sm text-gray-600 ml-7">
                  {formData.is_public
                    ? t('quinielas.publicDesc')
                    : t('quinielas.privateDesc')}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-thick border-blue-600 p-6">
              <h3 className="font-headline text-lg uppercase mb-2">{t('quinielas.whatHappensNext').toUpperCase()}</h3>
              <ul className="space-y-2 text-sm text-gray-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('quinielas.whatHappensNextItem1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('quinielas.whatHappensNextItem2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('quinielas.whatHappensNextItem3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('quinielas.whatHappensNextItem4')}</span>
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
                {createQuiniela.isPending ? t('quinielas.creating').toUpperCase() : t('quinielas.create').toUpperCase()}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={() => navigate('/quinielas')}
                disabled={createQuiniela.isPending}
              >
                {t('common.cancel').toUpperCase()}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
