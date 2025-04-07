import type React from 'react'

interface BadgeProps {
  text: string
  variant?: 'success' | 'warning' | 'error' | 'info'
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'defaultColor' }) => {
  return (
    <span className="sdk-badge" data-variant={variant}>
      {text}
    </span>
  )
}
