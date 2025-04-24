import type { ReactNode } from 'react'

export interface AlertProps {
  /** The variant of the alert */
  status?: 'info' | 'success' | 'warning' | 'error'
  /** The label text for the alert */
  label: string
  /** Optional children to be rendered inside the alert */
  children?: ReactNode
  /** Optional custom icon component to override the default icon */
  icon?: ReactNode
}
