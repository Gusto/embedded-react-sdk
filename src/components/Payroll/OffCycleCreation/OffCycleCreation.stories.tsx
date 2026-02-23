import { Suspense } from 'react'
import { useStoryState } from '../../../../.storybook/helpers/useStoryState'
import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import type { OffCycleReason } from '../OffCycleReasonSelection'
import { OffCycleCreationPresentation } from './OffCycleCreationPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleCreation')
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  useI18n('Payroll.OffCycleReasonSelection')
  return <>{children}</>
}

const defaultFormValues = {
  reason: 'bonus',
  isCheckOnly: false,
  startDate: null,
  endDate: null,
  checkDate: null,
}

export default {
  title: 'Domain/Payroll/OffCycleCreation',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <FormWrapper defaultValues={defaultFormValues}>
            <Story />
          </FormWrapper>
        </I18nLoader>
      </Suspense>
    ),
  ],
}

export const Default = () => {
  const { value: selectedReason, handleChange: handleReasonChange } = useStoryState<OffCycleReason>(
    'ReasonChange',
    'bonus',
  )
  const { value: isCheckOnly, handleChange: handleCheckOnlyChange } = useStoryState<boolean>(
    'CheckOnlyChange',
    false,
  )

  return (
    <OffCycleCreationPresentation
      selectedReason={selectedReason ?? 'bonus'}
      onReasonChange={handleReasonChange}
      isCheckOnly={isCheckOnly ?? false}
      onCheckOnlyChange={handleCheckOnlyChange}
    />
  )
}

export const CorrectionSelected = () => {
  const { value: selectedReason, handleChange: handleReasonChange } = useStoryState<OffCycleReason>(
    'ReasonChange',
    'correction',
  )
  const { value: isCheckOnly, handleChange: handleCheckOnlyChange } = useStoryState<boolean>(
    'CheckOnlyChange',
    false,
  )

  return (
    <OffCycleCreationPresentation
      selectedReason={selectedReason ?? 'correction'}
      onReasonChange={handleReasonChange}
      isCheckOnly={isCheckOnly ?? false}
      onCheckOnlyChange={handleCheckOnlyChange}
    />
  )
}

export const CheckOnlyMode = () => {
  const { value: selectedReason, handleChange: handleReasonChange } = useStoryState<OffCycleReason>(
    'ReasonChange',
    'bonus',
  )
  const { value: isCheckOnly, handleChange: handleCheckOnlyChange } = useStoryState<boolean>(
    'CheckOnlyChange',
    true,
  )

  return (
    <OffCycleCreationPresentation
      selectedReason={selectedReason ?? 'bonus'}
      onReasonChange={handleReasonChange}
      isCheckOnly={isCheckOnly ?? true}
      onCheckOnlyChange={handleCheckOnlyChange}
    />
  )
}
