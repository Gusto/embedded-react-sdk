import type { ReactNode } from 'react'

/**
 * Individual tab configuration
 */
export interface TabProps {
  /**
   * Unique identifier for the tab
   */
  id: string
  /**
   * Label to display in the tab button
   */
  label: ReactNode
  /**
   * Content to display in the tab panel
   */
  content: ReactNode
  /**
   * Whether the tab is disabled
   */
  isDisabled?: boolean
}

/**
 * Props for the Tabs component - provides accessible tab navigation (controlled only)
 *
 * Responsively adapts to container size:
 * - Below 640px (small breakpoint): renders as a dropdown select for mobile devices
 * - At or above 640px: renders as horizontal tabs for desktop views
 *
 * This adaptive behavior ensures WCAG 2.2 compliance by avoiding horizontal scrolling
 * without positional meaning, while maintaining a familiar tab interface on larger screens.
 */
export interface TabsProps {
  /**
   * Array of tab configuration objects
   */
  tabs: TabProps[]
  /**
   * Currently selected tab id
   */
  selectedId?: string
  /**
   * Callback when tab selection changes
   */
  onSelectionChange: (id: string) => void
  /**
   * Accessible label for the tabs
   */
  'aria-label'?: string
  /**
   * ID of element that labels the tabs
   */
  'aria-labelledby'?: string
  /**
   * Additional CSS class name
   */
  className?: string
}
