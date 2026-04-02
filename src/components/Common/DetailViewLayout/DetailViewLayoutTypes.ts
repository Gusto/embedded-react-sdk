import type { ReactNode } from 'react'
import type { TabProps } from '@/components/Common/UI/Tabs/TabsTypes'

type BackNavigation =
  | { onBack: () => void; backLabel: string }
  | { onBack?: never; backLabel?: never }

type TabbedContent =
  | {
      tabs: TabProps[]
      selectedTabId: string
      onTabChange: (id: string) => void
      children?: never
    }
  | {
      tabs?: never
      selectedTabId?: never
      onTabChange?: never
      children: ReactNode
    }

type BaseDetailViewLayoutProps = {
  /**
   * Page title displayed as a heading
   */
  title: string
  /**
   * Optional subtitle displayed below the title
   */
  subtitle?: string
  /**
   * Action buttons rendered in the page header (right-aligned on desktop)
   */
  actions?: ReactNode
  /**
   * Optional CSS class name applied to the root element
   */
  className?: string
}

export type DetailViewLayoutProps = BaseDetailViewLayoutProps & BackNavigation & TabbedContent
