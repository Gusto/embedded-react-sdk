import { useTranslation } from 'react-i18next'
import { useIndustryItems } from './Context'
import { ComboBoxField } from '@/components/Common'

export interface IndustryFormFields {
  naics_code: string
}

export const Edit = () => {
  const { t } = useTranslation('Company.Industry')
  const { items } = useIndustryItems()

  return (
    <ComboBoxField
      isRequired
      options={items}
      label={t('label')}
      name="naics_code"
      placeholder={t('placeholder')}
    />
  )
}
