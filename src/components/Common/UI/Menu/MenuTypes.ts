import type { ReactNode, RefObject } from 'react'
import type { DataAttributes } from '@/types/Helpers'

export interface MenuItem extends DataAttributes {
  label: string
  icon?: ReactNode
  onClick: () => void
  isDisabled?: boolean
  href?: string
}

export interface MenuProps extends DataAttributes {
  triggerRef?: RefObject<Element | null>
  items?: MenuItem[]
  isOpen?: boolean
  onClose?: () => void
  'aria-label': string
}
