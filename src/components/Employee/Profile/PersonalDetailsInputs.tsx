import * as v from 'valibot'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CalendarDate, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { ListBoxItem } from 'react-aria-components'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { type Employee } from '@gusto/embedded-api/models/components/employee'
import { Select, TextField, Grid } from '@/components/Common'
import { DatePicker } from '@/components/Common/Inputs/DatePicker'
import { addressInline, removeNonDigits } from '@/helpers/formattedStrings'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { nameValidation, SSN_REGEX } from '@/helpers/validations'

export const NameInputsSchema = v.object({
  firstName: nameValidation,
  middleInitial: v.optional(v.string()),
  lastName: nameValidation,
})

type NameInputsSchemaType = v.InferInput<typeof NameInputsSchema>

export function NameInputs() {
  const { control } = useFormContext<NameInputsSchemaType>()
  const { t } = useTranslation('Employee.Profile')

  return (
    <>
      <Grid gap={{ base: 20, small: 8 }} gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}>
        <TextField
          control={control}
          name="firstName"
          isRequired
          label={t('firstName')}
          errorMessage={t('validations.firstName')}
        />
        <TextField control={control} name="middleInitial" label={t('middleInitial')} />
      </Grid>
      <TextField
        control={control}
        name="lastName"
        isRequired
        label={t('lastName')}
        errorMessage={t('validations.lastName')}
      />
    </>
  )
}

export const AdminInputsSchema = v.object({
  workAddress: v.pipe(v.string(), v.nonEmpty()),
  startDate: v.pipe(
    v.instance(CalendarDate),
    v.transform(input => input.toString()),
    v.nonEmpty(),
    v.custom(value => {
      if (typeof value !== 'string') {
        return false
      }

      const startDate = parseDate(value)
      const maxDate = today(getLocalTimeZone()).add({ months: 6 })
      return startDate.compare(maxDate) <= 0
    }),
  ),
  email: v.pipe(v.string(), v.email()),
})

type AdminInputsSchemaType = v.InferInput<typeof AdminInputsSchema>

interface AdminInputsProps {
  companyLocations: Location[]
}

export function AdminInputs({ companyLocations }: AdminInputsProps) {
  const { t } = useTranslation('Employee.Profile')
  const {
    control,
    formState: { errors },
  } = useFormContext<AdminInputsSchemaType>()

  return (
    <>
      <Select
        control={control}
        name="workAddress"
        items={companyLocations}
        label={t('workAddress')}
        description={t('workAddressDescription')}
        placeholder={t('workAddressPlaceholder')}
        errorMessage={t('validations.location', { ns: 'common' })}
        isRequired
        validationBehavior="aria"
      >
        {(location: (typeof companyLocations)[0]) => (
          <ListBoxItem id={location.uuid} textValue={location.uuid}>
            {addressInline(location)}
          </ListBoxItem>
        )}
      </Select>
      <DatePicker
        control={control}
        name="startDate"
        label={t('startDateLabel')}
        description={t('startDateDescription')}
        errorMessage={
          errors.startDate?.type === 'custom'
            ? t('validations.startDateOutOfRange')
            : t('validations.startDate')
        }
      />
      <TextField
        control={control}
        name="email"
        label={t('email')}
        description={t('emailDescription')}
        errorMessage={t('validations.email')}
        isRequired
        type="email"
      />
    </>
  )
}

export const SocialSecurityNumberSchema = v.object({
  ssn: v.pipe(
    v.string(),
    v.transform(input => removeNonDigits(input)),
    v.check(input => {
      return SSN_REGEX.test(input)
    }),
  ),
  enableSsn: v.boolean(),
})

type SocialSecurityNumberSchemaType = v.InferInput<typeof SocialSecurityNumberSchema>

interface SocialSecurityNumberInputProps {
  employee?: Employee
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function SocialSecurityNumberInput({ employee, onChange }: SocialSecurityNumberInputProps) {
  const { control, setValue } = useFormContext<SocialSecurityNumberSchemaType>()
  const { t } = useTranslation('Employee.Profile')
  const placeholderSSN = usePlaceholderSSN(employee?.hasSsn)
  return (
    <TextField
      control={control}
      isRequired
      name="ssn"
      label={t('ssnLabel')}
      errorMessage={t('validations.ssn', { ns: 'common' })}
      inputProps={{
        placeholder: placeholderSSN,
        onChange: event => {
          setValue('enableSsn', true)
          setValue('ssn', normalizeSSN(event.target.value))
          onChange?.(event)
        },
      }}
    />
  )
}

export const DateOfBirthSchema = v.object({
  dateOfBirth: v.pipe(
    v.instance(CalendarDate),
    v.transform(input => input.toString()),
    v.nonEmpty(),
  ),
})

type DateOfBirthSchemaType = v.InferInput<typeof DateOfBirthSchema>

export function DateOfBirthInput() {
  const { control } = useFormContext<DateOfBirthSchemaType>()
  const { t } = useTranslation('Employee.Profile')
  return (
    <DatePicker
      control={control}
      name="dateOfBirth"
      label={t('dobLabel')}
      errorMessage={t('validations.dob', { ns: 'common' })}
    />
  )
}

// All possible inputs for PersonalDetails forms
const PersonalDetailsTotalSchema = v.object({
  ...NameInputsSchema.entries,
  ...AdminInputsSchema.entries,
  ...SocialSecurityNumberSchema.entries,
  ...DateOfBirthSchema.entries,
  selfOnboarding: v.boolean(),
  enableSsn: v.boolean(),
})

type NullableDatesMapper<Source> = {
  [Property in keyof Source]: Source[Property] extends CalendarDate
    ? Source[Property] | null
    : Source[Property]
}

export type PersonalDetailsPayload = v.InferOutput<typeof PersonalDetailsTotalSchema>

//Typescript magic to mark date fields as nullable for correct defaultvalues
export type PersonalDetailsInputs = NullableDatesMapper<
  v.InferInput<typeof PersonalDetailsTotalSchema>
>
