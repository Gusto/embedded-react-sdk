import * as v from 'valibot'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { type Employee } from '@gusto/embedded-api/models/components/employee'
import { SelectField, TextInputField, Grid, DatePickerField } from '@/components/Common'
import { addressInline, removeNonDigits } from '@/helpers/formattedStrings'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { nameValidation, SSN_REGEX } from '@/helpers/validations'

export const NameInputsSchema = v.object({
  firstName: nameValidation,
  middleInitial: v.optional(v.string()),
  lastName: nameValidation,
})

export function NameInputs() {
  const { t } = useTranslation('Employee.Profile')

  return (
    <>
      <Grid gap={{ base: 20, small: 8 }} gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}>
        <TextInputField
          name="firstName"
          isRequired
          label={t('firstName')}
          errorMessage={t('validations.firstName')}
        />
        <TextInputField name="middleInitial" label={t('middleInitial')} />
      </Grid>
      <TextInputField
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
    v.instance(Date),
    v.transform(date => date.toISOString().split('T')[0]),
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
    formState: { errors },
  } = useFormContext<AdminInputsSchemaType>()

  return (
    <>
      <SelectField
        name="workAddress"
        options={companyLocations.map(location => ({
          value: location.uuid,
          label: addressInline(location),
        }))}
        label={t('workAddress')}
        description={t('workAddressDescription')}
        placeholder={t('workAddressPlaceholder')}
        errorMessage={t('validations.location', { ns: 'common' })}
        isRequired
      />
      <DatePickerField
        name="startDate"
        label={t('startDateLabel')}
        description={t('startDateDescription')}
        errorMessage={
          errors.startDate?.type === 'custom'
            ? t('validations.startDateOutOfRange')
            : t('validations.startDate')
        }
      />
      <TextInputField
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
  onChange?: (updatedValue: string) => void
}

export function SocialSecurityNumberInput({ employee, onChange }: SocialSecurityNumberInputProps) {
  const { setValue } = useFormContext<SocialSecurityNumberSchemaType>()
  const { t } = useTranslation('Employee.Profile')
  const placeholderSSN = usePlaceholderSSN(employee?.hasSsn)
  return (
    <TextInputField
      isRequired
      name="ssn"
      label={t('ssnLabel')}
      errorMessage={t('validations.ssn', { ns: 'common' })}
      placeholder={placeholderSSN}
      transform={normalizeSSN}
      onChange={updatedValue => {
        setValue('enableSsn', true)
        onChange?.(updatedValue)
      }}
    />
  )
}

export const DateOfBirthSchema = v.object({
  dateOfBirth: v.pipe(
    v.instance(Date),
    v.transform(date => date.toISOString().split('T')[0]),
  ),
})

export function DateOfBirthInput() {
  const { t } = useTranslation('Employee.Profile')
  return (
    <DatePickerField
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
  [Property in keyof Source]: Source[Property] extends Date
    ? Source[Property] | null
    : Source[Property]
}

export type PersonalDetailsPayload = v.InferOutput<typeof PersonalDetailsTotalSchema>

//Typescript magic to mark date fields as nullable for correct defaultvalues
export type PersonalDetailsInputs = NullableDatesMapper<
  v.InferInput<typeof PersonalDetailsTotalSchema>
>
