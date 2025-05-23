import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { phoneValidation, zipValidation } from '@/helpers/validations'
import { CheckboxGroupField, Flex, Grid, SelectField, TextInputField } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'
import { commonMasks, useMaskedTransform } from '@/helpers/mask'

export const LocationFormSchema = z.object({
  phoneNumber: phoneValidation,
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: zipValidation,
  addressType: z.array(z.enum(['mailingAddress', 'filingAddress'])).optional(),
})

export type LocationFormInputs = z.infer<typeof LocationFormSchema>

export function Form() {
  const { t } = useTranslation('Company.Locations')
  const transform = useMaskedTransform(commonMasks.phoneMask)

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
        <SelectField
          name="state"
          options={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
            label: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
            value: stateAbbr,
          }))}
          label={t('stateLabel')}
          placeholder={t('statePlaceholder')}
          errorMessage={t('validations.state')}
          isRequired
        />
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
          transform={transform}
        />
      </Grid>
      <CheckboxGroupField
        name="addressType"
        label={t('addressTypeLabel')}
        options={[
          {
            value: 'mailingAddress',
            label: t('mailingAddressLabel'),
            description: t('mailingAddressDescription'),
          },
          {
            value: 'filingAddress',
            label: t('filingAddressLabel'),
            description: t('filingAddressDescription'),
          },
        ]}
      />
    </Flex>
  )
}
