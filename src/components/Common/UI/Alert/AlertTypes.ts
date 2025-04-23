import type { ReactNode, ComponentType } from 'react'
import type { SVGProps } from 'react'

export interface AlertProps {
  /** The variant of the alert */
  variant?: 'info' | 'success' | 'warning' | 'error'
  /** The label text for the alert */
  label: string
  /** Optional children to be rendered inside the alert */
  children?: ReactNode
  /** Optional custom icon component to override the default icon */
  icon?: ComponentType<SVGProps<SVGSVGElement> & { title?: string }>
}
