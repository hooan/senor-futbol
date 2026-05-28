import { Link } from 'react-router-dom'
import type { QuinielaWithDetails } from '@/types/database'
import { format } from 'date-fns'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

interface QuinielaCardProps {
  quiniela: QuinielaWithDetails
}

export default function QuinielaCard({ quiniela }: QuinielaCardProps) {
  const isPastDeadline = new Date(quiniela.deadline) < new Date()
  const deadlineDate = new Date(quiniela.deadline)

  return (
    <Card className="hover:shadow-brutal transition-shadow">
      <Link to={`/quinielas/${quiniela.share_code}`} className="block no-underline">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-headline text-xl uppercase mb-2 truncate">
                {quiniela.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-mono">by @{quiniela.creator.username}</span>
                <span>•</span>
                <span>{quiniela.participants_count} participants</span>
              </div>
            </div>
            <Badge variant={quiniela.is_public ? 'success' : 'warning'}>
              {quiniela.is_public ? 'PUBLIC' : 'PRIVATE'}
            </Badge>
          </div>

          {/* Description */}
          {quiniela.description && (
            <p className="text-sm text-gray-700 line-clamp-2">{quiniela.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t-3 border-gray-200">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                Deadline
              </span>
              <span className={`font-mono text-sm ${isPastDeadline ? 'text-red-600' : 'text-gray-900'}`}>
                {format(deadlineDate, 'MMM d, h:mm a')}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                Share Code
              </span>
              <span className="font-mono text-sm font-bold bg-gray-100 px-3 py-1 border-3 border-gray-900">
                {quiniela.share_code}
              </span>
            </div>
          </div>

          {isPastDeadline && (
            <div className="flex items-center gap-2 text-xs text-red-600 font-semibold uppercase">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Deadline Passed
            </div>
          )}
        </div>
      </Link>
    </Card>
  )
}
