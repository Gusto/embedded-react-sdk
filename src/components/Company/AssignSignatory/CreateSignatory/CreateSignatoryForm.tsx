import * as v from 'valibot'
import { useTranslation } from 'react-i18next'
import { useCreateSignatory } from './useCreateSignatory'
import { TextInputField, Grid, Flex, SelectField, DatePickerField } from '@/components/Common'
import { nameValidation, zipValidation, SSN_REGEX, phoneValidation } from '@/helpers/validations'
import { STATES_ABBR } from '@/shared/constants'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { TitleSelect } from '@/components/Company/AssignSignatory/TitleSelect'
import { normalizePhone } from '@/helpers/phone'
import { removeNonDigits } from '@/helpers/formattedStrings'

const createSSNValidation = (hasSsn?: boolean) =>
  v.pipe(
    v.string(),
    v.custom(value => {
      // If they have an SSN on file and haven't modified the field (it's empty), it's valid
      if (hasSsn && !value) {
        return true
      }

      if (typeof value !== 'string') {
        return false
      }

      return SSN_REGEX.test(removeNonDigits(value))
    }),
  )

export const generateCreateSignatorySchema = (hasSsn?: boolean) =>
  v.object({
    firstName: nameValidation,
    lastName: nameValidation,
    email: v.pipe(v.string(), v.nonEmpty(), v.email()),
    title: v.pipe(v.string(), v.nonEmpty()),
    phone: phoneValidation,
    ssn: createSSNValidation(hasSsn),
    birthday: v.instance(Date),
    street1: v.pipe(v.string(), v.nonEmpty()),
    street2: v.optional(v.string()),
    city: v.pipe(v.string(), v.nonEmpty()),
    state: v.pipe(v.string(), v.nonEmpty()),
    zip: zipValidation,
  })

export type CreateSignatoryInputs = v.InferInput<ReturnType<typeof generateCreateSignatorySchema>>

export const CreateSignatoryForm = () => {
  const { currentSignatory } = useCreateSignatory()
  const { t } = useTranslation('Company.AssignSignatory')
  const placeholderSSN = usePlaceholderSSN(currentSignatory?.hasSsn)

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={12}>
        <header>
          <h2>{t('signatoryDetails.title')}</h2>
          <p>{t('signatoryDetails.description')}</p>
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
            transform={normalizePhone}
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
          <h2>{t('address.title')}</h2>
          <p>{t('address.description')}</p>
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
