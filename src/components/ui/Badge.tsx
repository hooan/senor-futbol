import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export default function Badge({
  variant = 'default',
  children,
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-raw-black text-raw-white border-raw-black',
    success: 'bg-raw-green text-raw-white border-raw-green',
    warning: 'bg-raw-orange text-raw-white border-raw-orange',
    error: 'bg-raw-red text-raw-white border-raw-red',
    info: 'bg-raw-blue text-raw-white border-raw-blue',
  }
  
  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 border-thin font-mono text-xs uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
