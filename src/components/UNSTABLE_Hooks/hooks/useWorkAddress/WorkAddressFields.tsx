import type { ReactNode, ComponentType } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Location as LocationModel } from '@gusto/embedded-api/models/components/location'
import { useFieldMetadata } from '../../FormFieldsContext'
import type { WorkAddressFormData } from './schema'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { SelectField } from '@/components/Common/Fields/SelectField/SelectField'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField/DatePickerField'

interface FieldProps {
  label: ReactNode
  description?: ReactNode
  placeholder?: string
}

interface FieldPropsWithValidations<TValidationKeys extends string> extends FieldProps {
  validationMessages: Record<TValidationKeys, string>
}

type RequiredValidation = 'REQUIRED'

function useFieldErrorMessage<TKeys extends string>(
  fieldName: keyof WorkAddressFormData,
  validationMessages: Record<TKeys, string>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<WorkAddressFormData>()
  const errorCode = errors[fieldName]?.message as TKeys | undefined
  return errorCode ? validationMessages[errorCode] : undefined
}

export type LocationFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  getOptionLabel?: (location: LocationModel) => string
  FieldComponent?: ComponentType<SelectProps>
}

export function Location({
  label,
  description,
  placeholder,
  validationMessages,
  getOptionLabel,
  FieldComponent,
}: LocationFieldProps) {
  const {
    options = [],
    entries = [],
    isDisabled,
  } = useFieldMetadata<WorkAddressFormData, LocationModel>('locationUuid')
  const errorMessage = useFieldErrorMessage('locationUuid', validationMessages)

  const resolvedOptions = getOptionLabel
    ? entries.map(location => ({ label: getOptionLabel(location), value: location.uuid }))
    : options

  return (
    <SelectField
      name="locationUuid"
      isRequired
      label={typeof label === 'string' ? label : ''}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      options={resolvedOptions}
      isDisabled={isDisabled}
      FieldComponent={FieldComponent}
    />
  )
}

export type EffectiveDateFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  FieldComponent?: ComponentType<DatePickerProps>
}

export function EffectiveDate({ label, description, validationMessages }: EffectiveDateFieldProps) {
  const errorMessage = useFieldErrorMessage('effectiveDate', validationMessages)

  return (
    <DatePickerField
      name="effectiveDate"
      isRequired
      label={typeof label === 'string' ? label : ''}
      description={description}
      errorMessage={errorMessage}
    />
  )
}

export interface WorkAddressFieldComponents {
  Location: typeof Location
  EffectiveDate: typeof EffectiveDate
}
