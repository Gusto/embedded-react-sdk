import type { ReactNode } from 'react'
import type { TabProps } from '@/components/Common/UI/Tabs/TabsTypes'

export interface DetailViewLayoutProps {
  /**
   * Page title displayed as a heading
   */
  title: string
  /**
   * Optional subtitle displayed below the title
   */
  subtitle?: string
  /**
   * Callback for the back navigation button. When omitted, the back bar is hidden.
   */
  onBack?: () => void
  /**
   * Label for the back navigation button (e.g., "Time off policies")
   */
  backLabel?: string
  /**
   * Action buttons rendered in the page header (right-aligned on desktop)
   */
  actions?: ReactNode
  /**
   * Tab definitions including id, label, and content for each tab
   */
  tabs: TabProps[]
  /**
   * Currently selected tab id
   */
  selectedTabId: string
  /**
   * Callback when the selected tab changes
   */
  onTabChange: (id: string) => void
  /**
   * Optional CSS class name applied to the root element
   */
  className?: string
}
