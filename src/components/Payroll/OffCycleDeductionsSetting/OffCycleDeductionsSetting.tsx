import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OFF_CYCLE_REASON_DEFAULTS } from '../OffCycleReasonSelection'
import type { OffCycleDeductionsSettingProps } from './types'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type DeductionsValue = 'include' | 'skip'

export function OffCycleDeductionsSetting({
  dictionary,
  offCycleReason,
  onEvent,
}: OffCycleDeductionsSettingProps) {
  useComponentDictionary('Payroll.OffCycleDeductionsSetting', dictionary)
  useI18n('Payroll.OffCycleDeductionsSetting')

  const { t } = useTranslation('Payroll.OffCycleDeductionsSetting')
  const { RadioGroup } = useComponentContext()

  const defaultSkip = OFF_CYCLE_REASON_DEFAULTS[offCycleReason].skipDeductions
  const [skipRegularDeductions, setSkipRegularDeductions] = useState(defaultSkip)

  useEffect(() => {
    setSkipRegularDeductions(OFF_CYCLE_REASON_DEFAULTS[offCycleReason].skipDeductions)
  }, [offCycleReason])

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
    const shouldSkip = value === 'skip'
    setSkipRegularDeductions(shouldSkip)
    onEvent(componentEvents.OFF_CYCLE_DEDUCTIONS_CHANGE, {
      skipRegularDeductions: shouldSkip,
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
