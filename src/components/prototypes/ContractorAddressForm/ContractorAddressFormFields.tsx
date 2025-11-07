import { SelectField } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'
import { TextInputField } from '@/components/Common'
import { SIGNATORY_TITLES } from '@/shared/constants'
import type { TextInputFieldProps } from '@/components/Common/Fields/TextInputField/TextInputField'
import type { SelectFieldProps } from '@/components/Common/Fields/SelectField/SelectField'

type StateAbbreviation = (typeof STATES_ABBR)[number]
type SignatoryTitle = (typeof SIGNATORY_TITLES)[keyof typeof SIGNATORY_TITLES]

function objectEntriesWithTypes<T extends Record<string, unknown>>(
  obj: T,
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}

interface FieldProps {
  label: React.ReactNode
  description?: React.ReactNode
  placeholder?: string
}

interface FieldPropsWithValidations<TValidationKeys extends string> extends FieldProps {
  validationMessages: Record<TValidationKeys, string>
}

const RequiredValidationKey = 'required' as const

export type Street1FieldProps = FieldPropsWithValidations<typeof RequiredValidationKey> & {
  renderInput?: TextInputFieldProps['renderInput']
}

export function Street1({
  label,
  description,
  placeholder,
  validationMessages,
}: Street1FieldProps) {
  return (
    <TextInputField
      name="street1"
      label={label}
      description={description}
      placeholder={placeholder}
      isRequired
      errorMessage={validationMessages[RequiredValidationKey]}
    />
  )
}

export type Street2FieldProps = FieldProps & {
  renderInput?: TextInputFieldProps['renderInput']
}

export function Street2({ label, description, placeholder }: Street2FieldProps) {
  return (
    <TextInputField
      name="street2"
      label={label}
      description={description}
      placeholder={placeholder}
    />
  )
}

export type CityFieldProps = FieldPropsWithValidations<typeof RequiredValidationKey> & {
  renderInput?: TextInputFieldProps['renderInput']
}

export function City({
  label,
  description,
  placeholder,
  validationMessages,
}: FieldPropsWithValidations<typeof RequiredValidationKey>) {
  return (
    <TextInputField
      name="city"
      label={label}
      description={description}
      placeholder={placeholder}
      isRequired
      errorMessage={validationMessages[RequiredValidationKey]}
    />
  )
}

export type StateFieldProps = FieldPropsWithValidations<typeof RequiredValidationKey> & {
  getOptionLabel?: (value: StateAbbreviation) => string
  renderInput?: SelectFieldProps['renderInput']
}

export function State({
  label,
  description,
  placeholder,
  validationMessages,
  getOptionLabel = value => value,
  renderInput,
}: StateFieldProps) {
  return (
    <SelectField
      name="state"
      label={label}
      description={description}
      placeholder={placeholder}
      isRequired
      errorMessage={validationMessages[RequiredValidationKey]}
      options={STATES_ABBR.map(stateAbbr => ({
        label: getOptionLabel(stateAbbr),
        value: stateAbbr,
      }))}
      renderInput={renderInput}
    />
  )
}

export type ZipFieldProps = FieldPropsWithValidations<typeof RequiredValidationKey> & {
  renderInput?: TextInputFieldProps['renderInput']
}

export function Zip({
  label,
  description,
  placeholder,
  validationMessages,
}: FieldPropsWithValidations<typeof RequiredValidationKey>) {
  return (
    <TextInputField
      name="zip"
      label={label}
      description={description}
      placeholder={placeholder}
      isRequired
      errorMessage={validationMessages[RequiredValidationKey]}
    />
  )
}

// This one isn't actually used, looking to get more cases of defining options
export type TitleSelectProps = FieldPropsWithValidations<typeof RequiredValidationKey> & {
  getOptionLabel?: (value: SignatoryTitle) => string
}

export function TitleSelect({
  label,
  description,
  placeholder,
  validationMessages,
  getOptionLabel = value => value,
}: TitleSelectProps) {
  const titleOptions = objectEntriesWithTypes(SIGNATORY_TITLES).map(([key, value]) => ({
    value: key,
    label: getOptionLabel(value),
  }))

  return (
    <SelectField
      name="title"
      label={label}
      description={description}
      placeholder={placeholder}
      isRequired
      options={titleOptions}
      errorMessage={validationMessages[RequiredValidationKey]}
    />
  )
}
