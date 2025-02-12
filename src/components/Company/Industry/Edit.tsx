import { ComboBox } from '@/components/Common'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IndustryFormFields, useIndustryItems } from './Industry'

export const Edit = () => {
  const { t } = useTranslation('Company.Industry')
  const { control } = useFormContext<IndustryFormFields>()
  const { items } = useIndustryItems()

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
