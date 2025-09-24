import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type {
  RadioGroupProps,
  RadioGroupOption,
} from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  useStringifyGenericFieldValue,
  type OptionWithGenericValue,
} from '@/components/Common/Fields/hooks/useStringifyGenericFieldValue'

type GenericRadioGroupOption<TValue> = OptionWithGenericValue<TValue, RadioGroupOption>

export interface RadioGroupFieldProps<TValue>
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'options' | 'isInvalid'>,
    UseFieldProps<TValue> {
  options: GenericRadioGroupOption<TValue>[]
  convertValueToString?: (value: TValue) => string
}

export const RadioGroupField = <TValue = string,>({
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
  ...radioGroupProps
}: RadioGroupFieldProps<TValue>) => {
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

  const stringFieldProps = useStringifyGenericFieldValue<TValue, RadioGroupOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  return <Components.RadioGroup {...radioGroupProps} {...fieldProps} {...stringFieldProps} />
}
