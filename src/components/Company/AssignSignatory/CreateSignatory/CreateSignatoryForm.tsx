import { useFormContext } from 'react-hook-form'
import * as v from 'valibot'
import { useTranslation } from 'react-i18next'
import { ListBoxItem } from 'react-aria-components'
import { CalendarDate } from '@internationalized/date'
import { useCreateSignatory } from './CreateSignatory'
import { TextField, Grid, Flex, Select } from '@/components/Common'
import { DatePicker } from '@/components/Common/Inputs/DatePicker'
import { nameValidation, zipValidation, SSN_REGEX, phoneValidation } from '@/helpers/validations'
import { STATES_ABBR } from '@/shared/constants'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { TitleSelect } from '@/components/Company/AssignSignatory/TitleSelect'
import { normalizePhone } from '@/helpers/phone'
import { removeNonDigits } from '@/helpers/formattedStrings'

const createSSNValidation = (currentSignatory?: { has_ssn?: boolean }) =>
  v.pipe(
    v.string(),
    v.custom(value => {
      // If they have an SSN on file and haven't modified the field (it's empty), it's valid
      if (currentSignatory?.has_ssn && !value) {
        return true
      }

      if (typeof value !== 'string') {
        return false
      }

      return SSN_REGEX.test(removeNonDigits(value))
    }),
  )

export const generateCreateSignatorySchema = (currentSignatory?: { has_ssn?: boolean }) =>
  v.object({
    first_name: nameValidation,
    last_name: nameValidation,
    email: v.pipe(v.string(), v.nonEmpty(), v.email()),
    title: v.pipe(v.string(), v.nonEmpty()),
    phone: phoneValidation,
    ssn: createSSNValidation(currentSignatory),
    birthday: v.instance(CalendarDate),
    street_1: v.pipe(v.string(), v.nonEmpty()),
    street_2: v.optional(v.string()),
    city: v.pipe(v.string(), v.nonEmpty()),
    state: v.pipe(v.string(), v.nonEmpty()),
    zip: zipValidation,
  })

export type CreateSignatoryInputs = v.InferInput<ReturnType<typeof generateCreateSignatorySchema>>

export const CreateSignatoryForm = () => {
  const { currentSignatory } = useCreateSignatory()
  const { t } = useTranslation('Company.AssignSignatory')
  const { control, setValue } = useFormContext()
  const placeholderSSN = usePlaceholderSSN(currentSignatory?.has_ssn)

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={12}>
        <header>
          <h2>{t('signatoryDetails.title')}</h2>
          <p>{t('signatoryDetails.description')}</p>
        </header>

        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
          <TextField
            control={control}
            name="first_name"
            label={t('signatoryDetails.firstName')}
            isRequired
            errorMessage={t('validations.firstName')}
          />
          <TextField
            control={control}
            name="last_name"
            label={t('signatoryDetails.lastName')}
            isRequired
            errorMessage={t('validations.lastName')}
          />
          <TextField
            control={control}
            name="email"
            label={t('signatoryDetails.email')}
            isRequired
            errorMessage={t('validations.email')}
            inputProps={{
              disabled: Boolean(currentSignatory),
            }}
          />
          <TitleSelect />
          <TextField
            control={control}
            name="phone"
            label={t('signatoryDetails.phone')}
            isRequired
            errorMessage={t('validations.phone')}
            inputProps={{
              onChange: event => {
                setValue('phone', normalizePhone(event.target.value))
              },
            }}
          />
          <TextField
            control={control}
            name="ssn"
            label={t('signatoryDetails.ssn')}
            errorMessage={t('validations.ssn', { ns: 'common' })}
            isRequired={!currentSignatory?.has_ssn}
            inputProps={{
              placeholder: placeholderSSN,
              onChange: event => {
                setValue('ssn', normalizeSSN(event.target.value))
              },
            }}
          />
          <DatePicker
            control={control}
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
          <TextField
            control={control}
            name="street_1"
            label={t('address.street1')}
            isRequired
            errorMessage={t('validations.address.street1')}
          />
          <TextField control={control} name="street_2" label={t('address.street2')} />
          <TextField
            control={control}
            name="city"
            label={t('address.city')}
            isRequired
            errorMessage={t('validations.address.city')}
          />
          <Select
            control={control}
            name="state"
            items={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
              name: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
              id: stateAbbr,
            }))}
            label={t('address.state')}
            placeholder={t('address.statePlaceholder')}
            errorMessage={t('validations.address.state')}
            isRequired
            validationBehavior="aria"
          >
            {(state: { name: string; id: string }) => <ListBoxItem>{state.name}</ListBoxItem>}
          </Select>
          <TextField
            control={control}
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
