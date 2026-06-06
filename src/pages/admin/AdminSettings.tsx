import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import { useFeatureFlags, useUpdateMultiTournamentFlag } from '@/hooks/useFeatureFlags'
import { useToast } from '@/contexts/ToastContext'

export default function AdminSettings() {
  const { data: flags, isLoading } = useFeatureFlags()
  const updateMultiTournamentFlag = useUpdateMultiTournamentFlag()
  const toast = useToast()

  const handleToggleMultiTournament = async () => {
    const nextValue = !(flags?.multiTournamentEnabled ?? false)

    try {
      await updateMultiTournamentFlag.mutateAsync(nextValue)
      toast.showToast(
        nextValue
          ? 'Multi-tournament mode enabled'
          : 'World Cup-only mode enabled',
        'success'
      )
    } catch (error) {
      console.error('Failed to update feature flag', error)
      toast.showToast('Failed to update feature flag', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  const isEnabled = flags?.multiTournamentEnabled ?? false

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-raw-black text-raw-white py-8 border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-4xl uppercase mb-2">APP SETTINGS</h1>
              <p className="text-gray-300">Control feature flags and tournament mode</p>
            </div>
            <Link to="/admin">
              <Button variant="secondary" size="small">
                ← DASHBOARD
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="mb-8">
          <h2 className="font-headline text-2xl uppercase mb-5">TOURNAMENT MODE</h2>

          <div className="border-thick border-raw-black p-5 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-lg mb-1">Multi Tournament Mode</p>
                <p className="text-sm text-gray-600">
                  Toggle between World Cup-only public experience and multi-tournament mode.
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold border-thick ${
                  isEnabled
                    ? 'bg-green-100 border-green-600 text-green-800'
                    : 'bg-yellow-100 border-yellow-600 text-yellow-800'
                }`}
              >
                {isEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleToggleMultiTournament} disabled={updateMultiTournamentFlag.isPending}>
              {updateMultiTournamentFlag.isPending
                ? 'UPDATING...'
                : isEnabled
                  ? 'SWITCH TO WORLD CUP ONLY'
                  : 'ENABLE MULTI TOURNAMENT'}
            </Button>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-600">
          <h3 className="font-semibold text-blue-900 mb-2">Mode behavior</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• World Cup-only: tournament selector and tournament import controls are hidden.</li>
            <li>• Multi-tournament: selector and import controls become available again.</li>
            <li>• Existing data is preserved; the flag only changes visibility and behavior.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
