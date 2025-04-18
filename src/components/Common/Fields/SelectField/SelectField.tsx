import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SelectOption, SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
import {
  useStringifyGenericFieldValue,
  type OptionWithGenericValue,
} from '@/components/Common/Fields/hooks/useStringifyGenericFieldValue'

type GenericSelectOption<TValue> = OptionWithGenericValue<TValue, SelectOption>

export interface SelectFieldProps<TValue>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'options'>,
    UseFieldProps<TValue> {
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
  ...selectProps
}: SelectFieldProps<TValue>) => {
  const Components = useComponentContext()
  const { value, onChange, ...fieldProps } = useField<TValue>({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange: onChangeFromProps,
    transform,
  })

  const stringFieldProps = useStringifyGenericFieldValue<TValue, SelectOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  return <Components.Select {...selectProps} {...fieldProps} {...stringFieldProps} />
}
