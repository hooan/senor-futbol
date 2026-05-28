import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

export function generateShareCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
