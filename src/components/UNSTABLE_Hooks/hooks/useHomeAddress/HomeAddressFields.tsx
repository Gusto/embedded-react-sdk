import type { ReactNode, ComponentType } from 'react'
import { useFormContext } from 'react-hook-form'
import type { HomeAddressFormData, StateAbbr } from './schema'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { SelectField } from '@/components/Common/Fields/SelectField/SelectField'
import { CheckboxField } from '@/components/Common/Fields/CheckboxField/CheckboxField'
import { STATES_ABBR } from '@/shared/constants'

interface FieldProps {
  label: ReactNode
  description?: ReactNode
  placeholder?: string
}

interface FieldPropsWithValidations<TValidationKeys extends string> extends FieldProps {
  validationMessages: Record<TValidationKeys, string>
}

type RequiredValidation = 'REQUIRED'
type ZipValidation = 'REQUIRED' | 'INVALID_ZIP_FORMAT'

function useFieldErrorMessage<TKeys extends string>(
  fieldName: keyof HomeAddressFormData,
  validationMessages: Record<TKeys, string>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<HomeAddressFormData>()
  const errorCode = errors[fieldName]?.message as TKeys | undefined
  return errorCode ? validationMessages[errorCode] : undefined
}

// --- Street1 ---

export type Street1FieldProps = FieldPropsWithValidations<RequiredValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function Street1({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: Street1FieldProps) {
  const errorMessage = useFieldErrorMessage('street1', validationMessages)

  return (
    <TextInputField
      name="street1"
      isRequired
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      FieldComponent={FieldComponent}
    />
  )
}

// --- Street2 ---

export type Street2FieldProps = FieldProps & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function Street2({ label, description, placeholder, FieldComponent }: Street2FieldProps) {
  return (
    <TextInputField
      name="street2"
      label={label}
      description={description}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
    />
  )
}

// --- City ---

export type CityFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function City({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: CityFieldProps) {
  const errorMessage = useFieldErrorMessage('city', validationMessages)

  return (
    <TextInputField
      name="city"
      isRequired
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      FieldComponent={FieldComponent}
    />
  )
}

// --- State ---

export type StateFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  getOptionLabel?: (value: StateAbbr) => string
  FieldComponent?: ComponentType<SelectProps>
}

export function State({
  label,
  description,
  placeholder,
  validationMessages,
  getOptionLabel = value => value,
  FieldComponent,
}: StateFieldProps) {
  const errorMessage = useFieldErrorMessage('state', validationMessages)

  return (
    <SelectField
      name="state"
      isRequired
      label={typeof label === 'string' ? label : ''}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      options={STATES_ABBR.map(stateAbbr => ({
        label: getOptionLabel(stateAbbr),
        value: stateAbbr,
      }))}
      FieldComponent={FieldComponent}
    />
  )
}

// --- Zip ---

export type ZipFieldProps = FieldPropsWithValidations<ZipValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function Zip({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: ZipFieldProps) {
  const errorMessage = useFieldErrorMessage('zip', validationMessages)

  return (
    <TextInputField
      name="zip"
      isRequired
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      FieldComponent={FieldComponent}
    />
  )
}

// --- CourtesyWithholding ---

export type CourtesyWithholdingFieldProps = FieldProps & {
  FieldComponent?: ComponentType<CheckboxProps>
}

export function CourtesyWithholding({
  label,
  description,
  FieldComponent,
}: CourtesyWithholdingFieldProps) {
  return (
    <CheckboxField
      name="courtesyWithholding"
      label={typeof label === 'string' ? label : ''}
      description={description}
      FieldComponent={FieldComponent}
    />
  )
}

export interface HomeAddressFieldComponents {
  Street1: typeof Street1
  Street2: typeof Street2
  City: typeof City
  State: typeof State
  Zip: typeof Zip
  CourtesyWithholding: typeof CourtesyWithholding
}
