import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { type Employee } from '@gusto/embedded-api/models/components/employee'
import { SelectField, TextInputField, Grid, DatePickerField } from '@/components/Common'
import { addressInline, removeNonDigits } from '@/helpers/formattedStrings'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { nameValidation, SSN_REGEX } from '@/helpers/validations'

export const NameInputsSchema = z.object({
  firstName: nameValidation,
  middleInitial: z.string().optional(),
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

export const AdminInputsSchema = z.object({
  workAddress: z.string().min(1),
  startDate: z.date().transform(date => date.toISOString().split('T')[0]),
  email: z.string().email(),
})

type AdminInputsSchemaType = z.infer<typeof AdminInputsSchema>

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

export const SocialSecurityNumberSchema = z.object({
  ssn: z
    .string()
    .transform(input => removeNonDigits(input))
    .refine(input => SSN_REGEX.test(input)),
  enableSsn: z.boolean(),
})

type SocialSecurityNumberSchemaType = z.infer<typeof SocialSecurityNumberSchema>

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

export const DateOfBirthSchema = z.object({
  dateOfBirth: z.date().transform(date => date.toISOString().split('T')[0]),
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
const PersonalDetailsTotalSchema = z.object({
  ...NameInputsSchema.shape,
  ...AdminInputsSchema.shape,
  ...SocialSecurityNumberSchema.shape,
  ...DateOfBirthSchema.shape,
  selfOnboarding: z.boolean(),
  enableSsn: z.boolean(),
})

type NullableDatesMapper<Source> = {
  [Property in keyof Source]: Source[Property] extends Date
    ? Source[Property] | null
    : Source[Property]
}

export type PersonalDetailsPayload = z.infer<typeof PersonalDetailsTotalSchema>

//Typescript magic to mark date fields as nullable for correct defaultvalues
export type PersonalDetailsInputs = NullableDatesMapper<z.input<typeof PersonalDetailsTotalSchema>>
