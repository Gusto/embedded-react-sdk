import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Checkbox, NumberField, RadioGroup, TextField } from '@/components/Common'
import { useDeductions, type DeductionInputs } from '@/components/Employee/Deductions/Deductions'
import { useI18n } from '@/i18n'

export const DeductionForm = () => {
  const { mode } = useDeductions()
  const { control } = useFormContext<DeductionInputs>()
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions')

  const watchedRecurring = useWatch({ control, name: 'recurring' })
  const watchedDeductAsPercentage = useWatch({ control, name: 'deductAsPercentage' })

  if (mode !== 'ADD' && mode !== 'EDIT') return

  return (
    <>
      <h2>{mode === 'EDIT' ? t('editDeductionTitle') : t('addDeductionTitle')}</h2>
      <p>{t('addDeuctionDescription')}</p>
      <TextField
        control={control}
        name="description"
        label={t('descriptionLabel')}
        isRequired
        errorMessage={t('validations.description')}
      />
      <RadioGroup
        control={control}
        name="recurring"
        validationBehavior="aria"
        label={t('frequencyLabel')}
        options={[
          { value: 'true', label: t('frequencyRecurringOption') },
          { value: 'false', label: t('frequencyOneTimeOption') },
        ]}
      />
      <RadioGroup
        control={control}
        name="deductAsPercentage"
        label={t('deductionTypeLabel')}
        options={[
          { value: 'true', label: t('deductionTypePercentageOption') },
          { value: 'false', label: t('deductionTypeFixedAmountOption') },
        ]}
      />
      <NumberField
        control={control}
        name="amount"
        label={t('deductionAmountLabel')}
        style={watchedDeductAsPercentage === 'true' ? 'percent' : 'currency'}
        errorMessage={t('validations.amount')}
      />
      {watchedRecurring === 'true' && (
        <NumberField
          control={control}
          name="annualMaximum"
          label={t('annualMaxLabel')}
          style="currency"
        />
      )}
      <Checkbox control={control} name="courtOrdered">
        {t('courtOrderedLabel')}
      </Checkbox>
    </>
  )
}
