import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { OffCycleDeductionsSettingProps } from './types'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type DeductionsValue = 'include' | 'skip'

export function OffCycleDeductionsSetting({
  dictionary,
  skipRegularDeductions,
  onEvent,
}: OffCycleDeductionsSettingProps) {
  useComponentDictionary('Payroll.OffCycleDeductionsSetting', dictionary)
  useI18n('Payroll.OffCycleDeductionsSetting')

  const { t } = useTranslation('Payroll.OffCycleDeductionsSetting')
  const { RadioGroup } = useComponentContext()

  const options = useMemo(
    () => [
      {
        value: 'include' as const,
        label: t('options.include.label'),
      },
      {
        value: 'skip' as const,
        label: t('options.skip.label'),
      },
    ],
    [t],
  )

  const handleChange = (value: string) => {
    onEvent(componentEvents.OFF_CYCLE_DEDUCTIONS_CHANGE, {
      skipRegularDeductions: value === 'skip',
    })
  }

  const selectedValue: DeductionsValue = skipRegularDeductions ? 'skip' : 'include'

  return (
    <RadioGroup
      label={t('title')}
      description={t('description')}
      options={options}
      value={selectedValue}
      onChange={handleChange}
    />
  )
}
