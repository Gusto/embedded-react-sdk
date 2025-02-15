import { ListBoxItem } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/Common'
import { SIGNATORY_TITLES } from '@/shared/constants'

export const TitleSelect = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { control } = useFormContext()

  const titleOptions = Object.entries(SIGNATORY_TITLES).map(([key, value]) => ({
    id: key,
    name: t(`signatoryTitles.${value}`, { ns: 'common' }),
  }))

  return (
    <Select
      control={control}
      name="title"
      label={t('signatoryDetails.titleSelect.label')}
      isRequired
      items={titleOptions}
      errorMessage={t('validations.title')}
    >
      {option => <ListBoxItem>{option.name}</ListBoxItem>}
    </Select>
  )
}

export default TitleSelect
