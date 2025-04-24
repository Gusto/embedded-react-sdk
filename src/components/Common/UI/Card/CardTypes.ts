import type { ReactNode } from 'react'

export interface CardProps {
  /** Callback function when the card is selected */
  onSelect?: (checked: boolean) => void
  /** Content to be displayed inside the card */
  children: ReactNode
  /** Optional menu component to be displayed on the right side of the card */
  menu?: ReactNode
  /** Additional CSS class name */
  className?: string
}
