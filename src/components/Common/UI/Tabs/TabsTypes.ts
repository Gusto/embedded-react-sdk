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
 * Props for the Tabs component - provides accessible tab navigation
 */
export interface TabsProps {
  /**
   * Array of tab configuration objects
   */
  tabs: TabProps[]
  /**
   * Currently selected tab key
   */
  selectedKey?: string
  /**
   * Default selected tab key (uncontrolled)
   */
  defaultSelectedKey?: string
  /**
   * Callback when tab selection changes
   */
  onSelectionChange?: (key: string) => void
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
  /**
   * Additional HTML id
   */
  id?: string
}
