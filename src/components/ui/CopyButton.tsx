import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import Button from '@/components/ui/Button'

interface CopyButtonProps {
  text: string
  label?: string
  successMessage?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function CopyButton({
  text,
  label = 'COPY',
  successMessage = 'Copied to clipboard!',
  variant = 'secondary',
  size = 'small',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      showToast(successMessage, 'success', 2000)

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error')
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={copied}
      className={className}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          COPIED!
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          {label}
        </>
      )}
    </Button>
  )
}
