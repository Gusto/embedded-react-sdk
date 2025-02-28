import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { useDeductions } from './Deductions'
import { RadioGroup } from '@/components/Common'

export const IncludeDeductionsForm = () => {
  const { mode } = useDeductions()
  const { control } = useFormContext()
  const { t } = useTranslation('Employee.Deductions')
  if (mode !== 'INITIAL') return
  return (
    <RadioGroup
      control={control}
      name="includeDeductions"
      label={t('includeDeductionsFormLabel')}
      description={t('includeDeductionsDescription')}
      options={[
        { value: 'Yes', label: t('includeDeductionsYes') },
        { value: 'No', label: t('includeDeductionsNo') },
      ]}
    />
  )
}
