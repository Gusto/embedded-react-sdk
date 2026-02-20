import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { ComboBoxProps, ComboBoxOption } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  useStringifyGenericFieldValue,
  type OptionWithGenericValue,
} from '@/components/Common/Fields/hooks/useStringifyGenericFieldValue'

type GenericComboBoxOption<TValue> = OptionWithGenericValue<TValue, ComboBoxOption>

export interface ComboBoxFieldProps<TValue>
  extends
    Omit<
      ComboBoxProps,
      'name' | 'value' | 'onChange' | 'options' | 'isInvalid' | 'allowsCustomValue'
    >,
    UseFieldProps<TValue> {
  options: GenericComboBoxOption<TValue>[]
  convertValueToString?: (value: TValue) => string
  allowsCustomValue?: TValue extends string ? boolean : never
}

export const ComboBoxField = <TValue = string,>({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange: onChangeFromProps,
  transform,
  options,
  convertValueToString,
  description,
  onBlur,
  inputRef,
  ...comboBoxProps
}: ComboBoxFieldProps<TValue>) => {
  const Components = useComponentContext()
  const { value, onChange, ...fieldProps } = useField<TValue>({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange: onChangeFromProps,
    transform,
    description,
    onBlur,
    inputRef,
  })

  const stringFieldProps = useStringifyGenericFieldValue<TValue, ComboBoxOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  // useStringifyGenericFieldValue's onChange only fires for matched options, dropping freeform input.
  // Override with a direct pass-through. Cast is safe: allowsCustomValue constrains TValue extends string.
  const freeformOverride = comboBoxProps.allowsCustomValue
    ? {
        onChange: (val: string) => {
          onChange(val as TValue)
        },
      }
    : {}

  return (
    <Components.ComboBox
      {...comboBoxProps}
      {...fieldProps}
      {...stringFieldProps}
      {...freeformOverride}
    />
  )
}
