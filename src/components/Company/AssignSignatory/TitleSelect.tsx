import { useTranslation } from 'react-i18next'
import { SelectField } from '@/components/Common'
import { SIGNATORY_TITLES } from '@/shared/constants'

export const TitleSelect = () => {
  const { t } = useTranslation('Company.AssignSignatory')

  const titleOptions = Object.entries(SIGNATORY_TITLES).map(([key, value]) => ({
    value: key,
    label: t(`signatoryTitles.${value}`, { ns: 'common' }),
  }))

  return (
    <SelectField
      name="title"
      label={t('signatoryDetails.titleSelect.label')}
      isRequired
      options={titleOptions}
      errorMessage={t('validations.title')}
    />
  )
}

export default TitleSelect
