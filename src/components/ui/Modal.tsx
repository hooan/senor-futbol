import { useEffect, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className,
  ...props
}: ModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const sizeStyles = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-raw-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative bg-raw-white border-heavy border-raw-black w-full',
          sizeStyles[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="border-b-thick border-raw-black p-6 flex justify-between items-center">
            <h2 className="font-headline text-2xl uppercase">{title}</h2>
            <button
              onClick={onClose}
              className="text-raw-black hover:text-raw-red text-2xl font-bold leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
