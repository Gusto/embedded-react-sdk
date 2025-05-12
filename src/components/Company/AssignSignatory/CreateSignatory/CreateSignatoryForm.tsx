import { useTranslation } from 'react-i18next'
import type { InferInput } from 'valibot'
import { useCreateSignatory } from './useCreateSignatory'
import type { generateCreateSignatorySchema } from './Schema'
import { TextInputField, Grid, Flex, SelectField, DatePickerField } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { TitleSelect } from '@/components/Company/AssignSignatory/TitleSelect'
import { commonMasks, useMaskedTransform } from '@/helpers/mask'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type CreateSignatoryInputs = InferInput<ReturnType<typeof generateCreateSignatorySchema>>

export const CreateSignatoryForm = () => {
  const Components = useComponentContext()
  const { currentSignatory } = useCreateSignatory()
  const { t } = useTranslation('Company.AssignSignatory')
  const placeholderSSN = usePlaceholderSSN(currentSignatory?.hasSsn)
  const transformPhone = useMaskedTransform(commonMasks.phoneMask)

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={12}>
        <header>
          <Components.Heading as="h2">{t('signatoryDetails.title')}</Components.Heading>
          <Components.Text>{t('signatoryDetails.description')}</Components.Text>
        </header>

        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
          <TextInputField
            name="firstName"
            label={t('signatoryDetails.firstName')}
            isRequired
            errorMessage={t('validations.firstName')}
          />
          <TextInputField
            name="lastName"
            label={t('signatoryDetails.lastName')}
            isRequired
            errorMessage={t('validations.lastName')}
          />
          <TextInputField
            name="email"
            label={t('signatoryDetails.email')}
            isRequired
            errorMessage={t('validations.email')}
            isDisabled={Boolean(currentSignatory)}
          />
          <TitleSelect />
          <TextInputField
            name="phone"
            label={t('signatoryDetails.phone')}
            isRequired
            errorMessage={t('validations.phone')}
            transform={transformPhone}
          />
          <TextInputField
            name="ssn"
            label={t('signatoryDetails.ssn')}
            errorMessage={t('validations.ssn', { ns: 'common' })}
            isRequired={!currentSignatory?.hasSsn}
            transform={normalizeSSN}
            placeholder={placeholderSSN}
          />
          <DatePickerField
            name="birthday"
            label={t('signatoryDetails.birthday')}
            errorMessage={t('validations.dob')}
            isRequired
          />
        </Grid>
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <header>
          <Components.Heading as="h2">{t('address.title')}</Components.Heading>
          <Components.Text>{t('address.description')}</Components.Text>
        </header>

        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
          <TextInputField
            name="street1"
            label={t('address.street1')}
            isRequired
            errorMessage={t('validations.address.street1')}
          />
          <TextInputField name="street2" label={t('address.street2')} />
          <TextInputField
            name="city"
            label={t('address.city')}
            isRequired
            errorMessage={t('validations.address.city')}
          />
          <SelectField
            name="state"
            options={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
              label: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
              value: stateAbbr,
            }))}
            label={t('address.state')}
            placeholder={t('address.statePlaceholder')}
            errorMessage={t('validations.address.state')}
            isRequired
          />
          <TextInputField
            name="zip"
            label={t('address.zip')}
            isRequired
            errorMessage={t('validations.address.zip')}
          />
        </Grid>
      </Flex>
    </Flex>
  )
}
