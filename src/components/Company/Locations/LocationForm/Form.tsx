import { useFormContext } from 'react-hook-form'
import { ListBoxItem } from 'react-aria-components'
import * as v from 'valibot'
import { useTranslation } from 'react-i18next'
import { phoneValidation, zipValidation } from '@/helpers/validations'
import { CheckboxGroup, Flex, Grid, Select, TextInputField } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'

export const LocationFormSchema = v.object({
  phoneNumber: phoneValidation,
  street1: v.pipe(v.string(), v.nonEmpty()),
  street2: v.optional(v.string()),
  city: v.pipe(v.string(), v.nonEmpty()),
  state: v.pipe(v.string(), v.nonEmpty()),
  zip: zipValidation,
  addressType: v.optional(v.array(v.picklist(['mailingAddress', 'filingAddress']))),
})

export type LocationFormInputs = v.InferInput<typeof LocationFormSchema>

export function Form() {
  const { t } = useTranslation('Company.Locations')
  const { control } = useFormContext<LocationFormInputs>()

  return (
    <Flex flexDirection="column" gap={20}>
      <Grid
        gap={{ base: 20, small: 8 }}
        gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }}
      >
        <TextInputField
          name="street1"
          isRequired
          label={t('street1Label')}
          errorMessage={t('validations.street1')}
        />
        <TextInputField name="street2" label={t('street2Label')} />
        <TextInputField
          name="city"
          label={t('cityLabel')}
          isRequired
          errorMessage={t('validations.city')}
        />
        <Select
          control={control}
          name="state"
          items={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
            name: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
            id: stateAbbr,
          }))}
          label={t('stateLabel')}
          placeholder={t('statePlaceholder')}
          errorMessage={t('validations.state')}
          isRequired
          validationBehavior="aria"
        >
          {(state: { name: string; id: string }) => <ListBoxItem>{state.name}</ListBoxItem>}
        </Select>
        <TextInputField
          name="zip"
          isRequired
          label={t('zipLabel')}
          errorMessage={t('validations.zip')}
        />
        <TextInputField
          name="phoneNumber"
          isRequired
          label={t('phoneNumberLabel')}
          errorMessage={t('validations.phone')}
        />
      </Grid>
      <CheckboxGroup
        control={control}
        name="addressType"
        label={t('addressTypeLabel')}
        options={[
          {
            name: 'mailingAddress',
            label: t('mailingAddressLabel'),
            description: t('mailingAddressDescription'),
          },
          {
            name: 'filingAddress',
            label: t('filingAddressLabel'),
            description: t('filingAddressDescription'),
          },
        ]}
      />
    </Flex>
  )
}
