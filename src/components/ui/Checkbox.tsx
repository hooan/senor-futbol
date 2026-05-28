import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="flex items-center">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'peer appearance-none w-5 h-5 border-thick border-raw-black bg-raw-white',
              'checked:bg-raw-black',
              'focus:border-heavy focus:outline-none',
              'disabled:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed',
              'cursor-pointer',
              className
            )}
            disabled={disabled}
            {...props}
          />
          
          {/* Checkmark */}
          <svg
            className="absolute w-3 h-3 pointer-events-none hidden peer-checked:block text-raw-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        
        {label && (
          <label
            htmlFor={checkboxId}
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

Checkbox.displayName = 'Checkbox'

export default Checkbox
