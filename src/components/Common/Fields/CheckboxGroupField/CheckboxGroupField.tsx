import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { CheckboxGroupOption } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import {
  useStringifyGenericFieldValueArray,
  type OptionWithGenericValue,
} from '@/components/Common/Fields/hooks/useStringifyGenericFieldValue'

type GenericCheckboxGroupOption<TValue> = OptionWithGenericValue<TValue, CheckboxGroupOption>

export interface CheckboxGroupFieldProps<TValue>
  extends Omit<CheckboxGroupProps, 'value' | 'onChange' | 'options' | 'isInvalid'>,
    UseFieldProps<TValue[]> {
  options: GenericCheckboxGroupOption<TValue>[]
  convertValueToString?: (value: TValue) => string
}

export const CheckboxGroupField = <TValue = string,>({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange: onChangeFromProps,
  transform,
  options,
  description,
  onBlur,
  inputRef,
  convertValueToString,
  ...checkboxGroupProps
}: CheckboxGroupFieldProps<TValue>) => {
  const Components = useComponentContext()
  const { value, onChange, ...fieldProps } = useField({
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

  const stringFieldProps = useStringifyGenericFieldValueArray<TValue, CheckboxGroupOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  return <Components.CheckboxGroup {...checkboxGroupProps} {...fieldProps} {...stringFieldProps} />
}
