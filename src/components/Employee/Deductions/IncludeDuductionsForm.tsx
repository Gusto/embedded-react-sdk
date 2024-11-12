import { useTranslation } from 'react-i18next'
import { RadioGroup } from '@/components/Common'
import { useDeductions } from './Deductions'
import { useForm, useFormContext } from 'react-hook-form'
import { Radio } from 'react-aria-components'

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
    >
      <Radio value={'Yes'}>{t('includeDeductionsYes')}</Radio>
      <Radio value={'No'}>{t('includeDeductionsNo')}</Radio>
    </RadioGroup>
  )
}
