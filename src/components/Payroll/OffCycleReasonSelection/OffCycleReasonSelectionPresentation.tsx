import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { OffCycleReason } from './types'
import { RadioGroupField } from '@/components/Common'

interface OffCycleReasonSelectionPresentationProps {
  name: string
}

export function OffCycleReasonSelectionPresentation({
  name,
}: OffCycleReasonSelectionPresentationProps) {
  const { t } = useTranslation('Payroll.OffCycleReasonSelection')

  const options = useMemo(
    () => [
      {
        value: 'correction' as OffCycleReason,
        label: t('options.correction.label'),
        description: t('options.correction.description'),
      },
      {
        value: 'bonus' as OffCycleReason,
        label: t('options.bonus.label'),
        description: t('options.bonus.description'),
      },
    ],
    [t],
  )

  return (
    <RadioGroupField<OffCycleReason> name={name} label={t('title')} options={options} isRequired />
  )
}
