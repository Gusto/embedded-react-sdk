import type { MenuProps } from '../UI/Menu/MenuTypes'
import type { DataAttributes } from '@/types/Helpers'

/**
 * Props for the {@link HamburgerMenu} component.
 *
 * @internal
 */
export interface HamburgerMenuProps extends DataAttributes {
  /** Accessible label for the trigger button. Defaults to a localized "Open menu" string. */
  triggerLabel?: string
  /** Accessible label for the menu popover. Defaults to a localized menu label. */
  menuLabel?: string
  /** Items rendered inside the menu popover. */
  items: MenuProps['items']
  /** Called when the menu is dismissed. */
  onClose?: () => void
  /** Renders the trigger button in a loading state when true. */
  isLoading?: boolean
  /** Placement of the menu popover relative to the trigger. Defaults to `'bottom end'`. */
  placement?: MenuProps['placement']
}
