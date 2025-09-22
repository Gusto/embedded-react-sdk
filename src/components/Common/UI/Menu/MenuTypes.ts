import type { ReactNode, RefObject } from 'react'
import type { DataAttributes } from '@/types/Helpers'

export interface MenuItem extends DataAttributes {
  /**
   * Text label for the menu item
   */
  label: string
  /**
   * Optional icon to display before the label
   */
  icon?: ReactNode
  /**
   * Callback function when the menu item is clicked
   */
  onClick: () => void
  /**
   * Disables the menu item and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Optional URL to navigate to when clicked
   */
  href?: string
}

export interface MenuProps extends DataAttributes {
  /**
   * Reference to the element that triggers the menu
   */
  triggerRef?: RefObject<Element | null>
  /**
   * Array of menu items to display
   */
  items?: MenuItem[]
  /**
   * Controls whether the menu is currently open
   */
  isOpen?: boolean
  /**
   * Callback when the menu is closed
   */
  onClose?: () => void
  /**
   * Accessible label describing the menu's purpose
   */
  'aria-label': string
}

/**
 * Default prop values for Menu component.
 */
export const MenuDefaults = {
  isOpen: false,
} as const satisfies Partial<MenuProps>
