import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { OffCycleReason } from './types'
import { RadioGroupField } from '@/components/Common'

interface OffCycleReasonSelectionPresentationProps {
  name: string
  onChange?: (value: OffCycleReason) => void
  /**
   * Semantic heading level to nest the label in, so it's discoverable via heading-based
   * screen reader navigation. Leave unset when this renders alongside other headings that
   * already establish the page's heading structure (e.g. inside a larger flow).
   */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/** @internal */
export function OffCycleReasonSelectionPresentation({
  name,
  onChange,
  headingLevel,
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
    <RadioGroupField<OffCycleReason>
      name={name}
      label={t('title')}
      options={options}
      isRequired
      onChange={onChange}
      headingLevel={headingLevel}
    />
  )
}
