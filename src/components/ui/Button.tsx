import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'medium', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-body font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed'
    
    const variantStyles = {
      primary: disabled
        ? 'bg-raw-surface-sunken text-gray-400 border-thick border-gray-300'
        : 'bg-raw-black text-raw-white border-thick border-raw-black hover:bg-raw-white hover:text-raw-black active:border-heavy',
      secondary: disabled
        ? 'bg-raw-surface-sunken text-gray-400 border-thick border-gray-300'
        : 'bg-raw-white text-raw-black border-thick border-raw-black hover:bg-raw-black hover:text-raw-white active:border-heavy',
      ghost: disabled
        ? 'bg-transparent text-gray-400 underline'
        : 'bg-transparent text-raw-black no-underline hover:text-raw-blue hover:underline',
      destructive: disabled
        ? 'bg-raw-surface-sunken text-gray-400 border-thick border-gray-300'
        : 'bg-raw-red text-raw-white border-thick border-raw-black hover:bg-raw-black hover:text-raw-red active:border-heavy',
    }
    
    const sizeStyles = {
      small: 'px-4 py-2 text-xs min-h-[44px]',
      medium: 'px-6 py-2.5 text-sm min-h-[44px]',
      large: 'px-10 py-4 text-base min-h-[56px]',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
