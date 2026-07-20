import type { ReactNode } from 'react'

/**
 * Shape of a single tab configuration your {@link TabsProps | Tabs} implementation receives in its `tabs` prop.
 *
 * @public
 * @childOf {@link TabsProps}
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
 * Props your `Tabs` implementation must accept from the component adapter.
 * Renders tabbed navigation with associated content panels.
 *
 * @public
 * @group Component props
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
