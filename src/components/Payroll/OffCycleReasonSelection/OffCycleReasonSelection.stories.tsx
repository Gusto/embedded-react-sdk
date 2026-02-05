import { Suspense } from 'react'
import { useStoryState } from '../../../../.storybook/helpers/useStoryState'
import { OffCycleReasonSelectionPresentation } from './OffCycleReasonSelectionPresentation'
import type { OffCycleReason } from './types'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleReasonSelection')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/OffCycleReasonSelection',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <Story />
        </I18nLoader>
      </Suspense>
    ),
  ],
}

export const Default = () => {
  const { value, handleChange } = useStoryState<OffCycleReason | null>('OffCycleReasonChange', null)

  return (
    <OffCycleReasonSelectionPresentation
      selectedReason={value ?? null}
      onReasonChange={handleChange}
    />
  )
}

export const BonusSelected = () => {
  const { value, handleChange } = useStoryState<OffCycleReason | null>(
    'OffCycleReasonChange',
    'bonus',
  )

  return (
    <OffCycleReasonSelectionPresentation
      selectedReason={value ?? null}
      onReasonChange={handleChange}
    />
  )
}

export const CorrectionSelected = () => {
  const { value, handleChange } = useStoryState<OffCycleReason | null>(
    'OffCycleReasonChange',
    'correction',
  )

  return (
    <OffCycleReasonSelectionPresentation
      selectedReason={value ?? null}
      onReasonChange={handleChange}
    />
  )
}
