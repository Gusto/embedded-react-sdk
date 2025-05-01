import type { MenuProps } from '../UI/Menu/MenuTypes'
import type { DataAttributes } from '@/types/Helpers'

export interface HamburgerMenuProps extends DataAttributes {
  triggerLabel?: string
  menuLabel?: string
  items: MenuProps['items']
  onClose?: () => void
  isLoading?: boolean
}
