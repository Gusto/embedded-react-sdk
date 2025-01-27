import { useTranslation } from 'react-i18next'
import { RadioGroup } from '@/components/Common'
import { useDeductions } from './Deductions'
import { useFormContext } from 'react-hook-form'

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
