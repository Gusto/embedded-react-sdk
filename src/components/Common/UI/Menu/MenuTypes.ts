import type { ReactNode, RefObject } from 'react'
import type { DataAttributes } from '@/types/Helpers'

/**
 * Action entry your `Menu` implementation must accept for each entry in its `items` array
 * from the component adapter.
 *
 * @public
 * @group Utility Types
 */
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

/**
 * Props your `Menu` implementation must accept from the component adapter.
 * Renders a popover menu of actions anchored to a trigger element.
 *
 * @public
 * @group Component Props
 */
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
   *
   * @defaultValue `false`
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
  /**
   * Element to use as the portal container for the menu popover.
   * Overrides the default SDK root container from context.
   */
  portalContainer?: HTMLElement
  /**
   * Controls the placement of the menu popover relative to the trigger
   *
   * @defaultValue `'bottom start'`
   */
  placement?:
    | 'top'
    | 'top start'
    | 'top end'
    | 'bottom'
    | 'bottom start'
    | 'bottom end'
    | 'left'
    | 'right'
}

/**
 * Default prop values for the {@link Menu} component.
 *
 * @internal
 */
export const MenuDefaults = {
  isOpen: false,
  placement: 'bottom start',
} as const satisfies Partial<MenuProps>
