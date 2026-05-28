export default function Skeleton({
  className = '',
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
}) {
  const baseClasses = 'animate-pulse bg-gray-200'

  const variantClasses = {
    default: 'h-4 w-full',
    card: 'h-48 w-full',
    text: 'h-3 w-3/4',
    avatar: 'h-10 w-10',
    button: 'h-10 w-24',
  }

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
}

// Specific skeleton components for common patterns

export function CardSkeleton() {
  return (
    <div className="border-thick border-gray-200 p-6 space-y-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <div className="flex items-center gap-3 pt-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  )
}

export function NewsSkeleton() {
  return (
    <div className="border-thick border-gray-200 p-6">
      <div className="space-y-4">
        {/* Title */}
        <Skeleton className="h-8 w-3/4" />
        {/* Meta */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-5/6" />
        </div>
        {/* Button */}
        <Skeleton variant="button" />
      </div>
    </div>
  )
}

export function QuinielaCardSkeleton() {
  return (
    <div className="border-thick border-gray-200 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        {/* Description */}
        <Skeleton variant="text" />
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t-3 border-gray-200">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FixtureSkeleton() {
  return (
    <div className="border-thick border-gray-200 p-6">
      <div className="space-y-4">
        {/* Date & Status */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        {/* Teams */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="avatar" className="w-8 h-8" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="avatar" className="w-8 h-8" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        {/* Venue */}
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-3 border-gray-200">
          <Skeleton className="h-5 w-5" />
          <Skeleton variant="avatar" className="w-8 h-8" />
          <Skeleton className="h-4 w-32 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
