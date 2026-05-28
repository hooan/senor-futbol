import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'filter' | 'status'
  status?: 'active' | 'warning' | 'error' | 'default'
  active?: boolean
  children: React.ReactNode
}

export default function Chip({ 
  className, 
  variant = 'filter', 
  status = 'default',
  active = false,
  children, 
  ...props 
}: ChipProps) {
  const baseStyles = 'inline-flex items-center uppercase font-body font-semibold tracking-wider cursor-pointer select-none transition-colors'
  
  const filterStyles = active
    ? 'bg-raw-black text-raw-white border-thick border-raw-black px-3 py-1 text-xs'
    : 'bg-raw-white text-raw-black border-thick border-raw-black px-3 py-1 text-xs hover:bg-gray-100'
  
  const statusColors = {
    active: 'bg-raw-white text-raw-green border-thick border-raw-green',
    warning: 'bg-raw-white text-raw-orange border-thick border-raw-orange',
    error: 'bg-raw-white text-raw-red border-thick border-raw-red',
    default: 'bg-raw-white text-raw-black border-thick border-raw-black',
  }
  
  const statusStyles = `${statusColors[status]} px-2.5 py-0.5 text-xs`
  
  return (
    <div
      className={cn(
        baseStyles,
        variant === 'filter' ? filterStyles : statusStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
