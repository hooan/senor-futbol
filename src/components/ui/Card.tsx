import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
  children: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'bg-raw-white p-sp-4'
    
    const variantStyles = {
      default: 'border-thick border-raw-black',
      elevated: 'border-heavy border-raw-black',
    }
    
    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
