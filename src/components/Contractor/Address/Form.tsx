import { useTranslation } from 'react-i18next'
import { TextInputField, SelectField, Grid } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'

export function Form() {
  const { t } = useTranslation('Contractor.Address')

  return (
    <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
      <TextInputField
        name="street1"
        label={t('street1')}
        isRequired
        errorMessage={t('validations.street1')}
      />
      <TextInputField name="street2" label={t('street2', 'Street 2')} />
      <TextInputField
        name="city"
        label={t('city', 'City')}
        isRequired
        errorMessage={t('validations.city')}
      />
      <SelectField
        name="state"
        options={STATES_ABBR.map(stateAbbr => ({
          label: t(`statesHash.${stateAbbr}`, { ns: 'common', defaultValue: stateAbbr }),
          value: stateAbbr,
        }))}
        label={t('state', 'State')}
        placeholder={t('statePlaceholder')}
        errorMessage={t('validations.state')}
        isRequired
      />
      <TextInputField
        name="zip"
        label={t('zip', 'Zip')}
        isRequired
        errorMessage={t('validations.zip')}
      />
    </Grid>
  )
}
