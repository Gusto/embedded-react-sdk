import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useIndustryItems } from './Context'
import { ComboBoxField } from '@/components/Common'

export interface IndustryFormFields {
  naics_code: string
}

export const Edit = () => {
  const { t } = useTranslation('Company.Industry')
  const { items } = useIndustryItems()

  const options = useMemo(() => {
    return items.map(item => ({
      label: item.name,
      value: item.id,
    }))
  }, [items])

  return (
    <ComboBoxField
      isRequired
      options={options}
      label={t('label')}
      name="naics_code"
      placeholder={t('placeholder')}
    />
  )
}
