import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const radioId = id || `radio-${label?.toLowerCase().replace(/\s+/g, '-')}`
    
    return (
      <div className="flex items-center">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={cn(
              'peer appearance-none w-5 h-5 border-thick border-raw-black bg-raw-white rounded-full',
              'focus:border-heavy focus:outline-none',
              'disabled:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed',
              'cursor-pointer',
              className
            )}
            disabled={disabled}
            {...props}
          />
          
          {/* Inner dot */}
          <div className="absolute w-2.5 h-2.5 bg-raw-black rounded-full pointer-events-none hidden peer-checked:block" />
        </div>
        
        {label && (
          <label
            htmlFor={radioId}
            className={cn(
              'ml-2 font-body text-sm text-raw-black cursor-pointer select-none',
              disabled && 'text-gray-400 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export default Radio
