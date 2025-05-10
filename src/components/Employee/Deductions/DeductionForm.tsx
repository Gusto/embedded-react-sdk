import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDeductions, type DeductionInputs } from './useDeductions'
import {
  CheckboxField,
  NumberInputField,
  RadioGroupField,
  TextInputField,
} from '@/components/Common'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const DeductionForm = () => {
  const { mode } = useDeductions()
  const { control } = useFormContext<DeductionInputs>()
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  const watchedRecurring = useWatch({ control, name: 'recurring' })
  const watchedDeductAsPercentage = useWatch({ control, name: 'deductAsPercentage' })

  if (mode !== 'ADD' && mode !== 'EDIT') return

  return (
    <>
      <Components.Heading as="h2">
        {mode === 'EDIT' ? t('editDeductionTitle') : t('addDeductionTitle')}
      </Components.Heading>
      <Components.Text>{t('addDeuctionDescription')}</Components.Text>
      <TextInputField
        name="description"
        label={t('descriptionLabel')}
        isRequired
        errorMessage={t('validations.description')}
      />
      <RadioGroupField
        name="recurring"
        label={t('frequencyLabel')}
        options={[
          { value: 'true', label: t('frequencyRecurringOption') },
          { value: 'false', label: t('frequencyOneTimeOption') },
        ]}
      />
      <RadioGroupField
        name="deductAsPercentage"
        label={t('deductionTypeLabel')}
        options={[
          { value: 'true', label: t('deductionTypePercentageOption') },
          { value: 'false', label: t('deductionTypeFixedAmountOption') },
        ]}
      />
      <div className="deduction-amount-section">
        <NumberInputField
          name="amount"
          isRequired
          label={t('deductionAmountLabel')}
          format={watchedDeductAsPercentage === 'true' ? 'percent' : 'currency'}
          min={0}
          errorMessage={t('validations.amount')}
        />
      </div>
      {watchedRecurring === 'true' && (
        <NumberInputField name="limit" label={t('annualMaxLabel')} format="currency" min={0} />
      )}
      <CheckboxField name="courtOrdered" label={t('courtOrderedLabel')} />
    </>
  )
}
