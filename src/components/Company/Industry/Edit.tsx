import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useIndustryItems } from './Context'
import { ComboBox } from '@/components/Common'

export interface IndustryFormFields {
  naics_code: string
}

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
