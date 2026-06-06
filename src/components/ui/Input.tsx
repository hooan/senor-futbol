import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-headline text-sm uppercase mb-1 text-raw-black"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full font-mono text-mono bg-raw-surface-sunken text-raw-black border-thick border-raw-black px-3 py-3 min-h-[44px]',
            'hover:bg-gray-200 focus:outline-none focus:border-heavy focus:bg-raw-white',
            'disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed',
            error && 'border-raw-red focus:border-raw-red',
            className
          )}
          {...props}
        />
        
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1 text-xs font-body',
              error ? 'text-raw-red' : 'text-gray-600'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
