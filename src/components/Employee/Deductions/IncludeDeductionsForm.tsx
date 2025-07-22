import { useTranslation } from 'react-i18next'
import { useDeductions } from './useDeductions'
import { RadioGroupField } from '@/components/Common'

export const IncludeDeductionsForm = () => {
  const { mode } = useDeductions()
  const { t } = useTranslation('Employee.Deductions')
  if (mode !== 'INITIAL') return
  return (
    <RadioGroupField
      name="includeDeductions"
      isRequired
      label={t('includeDeductionsFormLabel')}
      description={t('includeDeductionsDescription')}
      options={[
        { value: 'Yes', label: t('includeDeductionsYes') },
        { value: 'No', label: t('includeDeductionsNo') },
      ]}
    />
  )
}
