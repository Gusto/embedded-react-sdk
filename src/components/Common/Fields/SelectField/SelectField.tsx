import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SelectOption, SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  useStringifyGenericFieldValue,
  type OptionWithGenericValue,
} from '@/components/Common/Fields/hooks/useStringifyGenericFieldValue'

type GenericSelectOption<TValue> = OptionWithGenericValue<TValue, SelectOption>

export interface SelectFieldProps<TValue>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'options' | 'isInvalid'>,
    UseFieldProps<TValue, HTMLButtonElement> {
  options: GenericSelectOption<TValue>[]
  convertValueToString?: (value: TValue) => string
}

export const SelectField = <TValue = string,>({
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
  ...selectProps
}: SelectFieldProps<TValue>) => {
  const Components = useComponentContext()
  const { value, onChange, ...fieldProps } = useField<TValue, HTMLButtonElement>({
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

  const stringFieldProps = useStringifyGenericFieldValue<TValue, SelectOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  return <Components.Select {...selectProps} {...fieldProps} {...stringFieldProps} />
}
