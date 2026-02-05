import { useTranslation } from 'react-i18next'
import type { OffCycleReason } from './types'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface OffCycleReasonSelectionPresentationProps {
  selectedReason: OffCycleReason | null
  onReasonChange: (reason: OffCycleReason) => void
}

export function OffCycleReasonSelectionPresentation({
  selectedReason,
  onReasonChange,
}: OffCycleReasonSelectionPresentationProps) {
  const { t } = useTranslation('Payroll.OffCycleReasonSelection')
  const { RadioGroup } = useComponentContext()

  const options = [
    {
      value: 'correction' as const,
      label: t('options.correction.label'),
      description: t('options.correction.description'),
    },
    {
      value: 'bonus' as const,
      label: t('options.bonus.label'),
      description: t('options.bonus.description'),
    },
  ]

  const handleChange = (value: string) => {
    onReasonChange(value as OffCycleReason)
  }

  return (
    <RadioGroup
      label={t('title')}
      options={options}
      value={selectedReason ?? undefined}
      onChange={handleChange}
      aria-label={t('aria.reasonSelection')}
    />
  )
}
