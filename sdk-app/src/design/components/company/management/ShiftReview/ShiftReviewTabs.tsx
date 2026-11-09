import type { ReactNode } from 'react'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type ShiftReviewTab = 'shifts' | 'policies'

export interface ShiftReviewTabsProps {
  selectedTab: ShiftReviewTab
  shifts: ReactNode
  policies: ReactNode
  successMessage?: string | null
  onTabChange: (tab: ShiftReviewTab) => void
  onDismissSuccess?: () => void
}

export function ShiftReviewTabs({
  selectedTab,
  shifts,
  policies,
  successMessage,
  onTabChange,
  onDismissSuccess,
}: ShiftReviewTabsProps) {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      {successMessage ? (
        <Components.Alert status="success" label={successMessage} onDismiss={onDismissSuccess} />
      ) : null}

      <Components.Tabs
        aria-label="Time tracking"
        selectedId={selectedTab}
        onSelectionChange={id => {
          onTabChange(id as ShiftReviewTab)
        }}
        tabs={[
          { id: 'shifts', label: 'Shifts', content: shifts },
          { id: 'policies', label: 'Policies', content: policies },
        ]}
      />
    </Flex>
  )
}
