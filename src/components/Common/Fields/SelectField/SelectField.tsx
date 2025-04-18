import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { Select } from '@/components/Common/UI/Select'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'

// Define the allowed types for the generic
type AllowedValue = string | number | boolean | null | undefined

interface SelectFieldProps<TValue extends AllowedValue = string>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur'>,
    UseFieldProps<TValue> {}

interface StringValueConverter<T> {
  value: string
  convertValue: (updatedValue: string) => T
}

/**
 * Creates a string value converter for a given value
 */
function getStringValueAndConvertHandler<T extends AllowedValue>(
  value: T,
): StringValueConverter<T> {
  // We'll build the converter based on the type of the input value
  let converter: StringValueConverter<AllowedValue>

  // Handle each possible type
  switch (typeof value) {
    case 'number':
      converter = {
        value: String(value),
        convertValue: (updatedValue: string) => Number(updatedValue),
      }
      break

    case 'boolean':
      converter = {
        value: value ? 'true' : 'false',
        convertValue: (updatedValue: string) => updatedValue === 'true',
      }
      break

    case 'string':
      converter = {
        value,
        convertValue: (updatedValue: string) => updatedValue,
      }
      break

    default:
      // Handle null and undefined
      if (value === null) {
        converter = {
          value: '',
          convertValue: () => null,
        }
      } else {
        // Must be undefined
        converter = {
          value: '',
          convertValue: () => undefined,
        }
      }
  }

  return converter as StringValueConverter<T>
}

export const SelectField = <TValue extends AllowedValue = string>({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...selectProps
}: SelectFieldProps<TValue>) => {
  const fieldProps = useField<TValue>({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  // Here we maintain the TValue type throughout
  const { value: stringValue, convertValue } = getStringValueAndConvertHandler<TValue>(
    fieldProps.value,
  )

  const handleChange = (updatedValue: string) => {
    const convertedValue = convertValue(updatedValue)
    if (onChange) {
      onChange(convertedValue)
    }
  }

  return (
    <Select
      {...selectProps}
      {...{
        ...fieldProps,
        value: stringValue,
        onChange: handleChange,
      }}
    />
  )
}
