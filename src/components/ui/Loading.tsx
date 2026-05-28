import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

export default function Loading({ 
  size = 'medium', 
  text,
  className,
  ...props 
}: LoadingProps) {
  const sizeStyles = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-thick',
    large: 'w-20 h-20 border-heavy',
  }
  
  return (
    <div 
      className={cn('flex flex-col items-center justify-center gap-4', className)}
      {...props}
    >
      <div className="relative">
        {/* Outer spinning square */}
        <div
          className={cn(
            'border-raw-black border-t-transparent animate-spin',
            sizeStyles[size]
          )}
        />
      </div>
      
      {text && (
        <p className="font-mono text-sm uppercase tracking-wider">{text}</p>
      )}
    </div>
  )
}

// Skeleton loading component for content placeholders
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 border-thin border-gray-300',
        className
      )}
      {...props}
    />
  )
}
