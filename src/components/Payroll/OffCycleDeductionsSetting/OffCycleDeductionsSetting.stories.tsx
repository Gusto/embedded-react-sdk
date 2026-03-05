import { Suspense } from 'react'
import { useStoryState } from '../../../../.storybook/helpers/useStoryState'
import { OffCycleDeductionsSetting } from './OffCycleDeductionsSetting'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleDeductionsSetting')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/OffCycleDeductionsSetting',
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

export const SkipDeductions = () => {
  const { handleChange } = useStoryState<{ skipRegularDeductions: boolean }>(
    'OffCycleDeductionsChange',
  )

  return (
    <OffCycleDeductionsSetting
      skipRegularDeductions={true}
      onEvent={(_event, payload) => handleChange(payload as { skipRegularDeductions: boolean })}
    />
  )
}

export const IncludeDeductions = () => {
  const { handleChange } = useStoryState<{ skipRegularDeductions: boolean }>(
    'OffCycleDeductionsChange',
  )

  return (
    <OffCycleDeductionsSetting
      skipRegularDeductions={false}
      onEvent={(_event, payload) => handleChange(payload as { skipRegularDeductions: boolean })}
    />
  )
}
