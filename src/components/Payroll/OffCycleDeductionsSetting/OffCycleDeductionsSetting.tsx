import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { OffCycleDeductionsSettingProps } from './types'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type DeductionsValue = 'include' | 'skip'

/**
 * Radio control for choosing whether an off-cycle payroll skips regular deductions and contributions.
 *
 * @remarks
 * Taxes are always included regardless of the selection. Selecting "Skip" blocks all regular
 * deductions and contributions except 401(k); selecting "Include" runs all regular deductions
 * and contributions normally.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `offCycle/deductionsChange` | Fired when the deduction preference changes | {@link OffCycleDeductionsSettingChangePayload} |
 *
 * @param props - {@link OffCycleDeductionsSettingProps}
 * @returns The rendered radio group.
 * @public
 */
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
