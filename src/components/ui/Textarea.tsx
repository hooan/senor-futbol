import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-headline text-sm uppercase mb-1 text-raw-black"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full font-body text-body bg-raw-surface-sunken text-raw-black border-thick border-raw-black px-3 py-2.5 min-h-[120px]',
            'hover:bg-gray-200 focus:outline-none focus:border-heavy focus:bg-raw-white resize-y',
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

Textarea.displayName = 'Textarea'

export default Textarea
