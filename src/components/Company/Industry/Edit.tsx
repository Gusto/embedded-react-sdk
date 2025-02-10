import { ComboBox } from '@/components/Common'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IndustryFormFields, useIndustryForm } from './Industry'

export const Edit = () => {
  const { t } = useTranslation('Company.Industry')
  const { control } = useFormContext<IndustryFormFields>()
  const { items } = useIndustryForm()

  return (
    <ComboBox
      control={control}
      isRequired
      items={items}
      label={t('label')}
      name="naics_code"
      placeholder={t('placeholder')}
    />
  )
}
