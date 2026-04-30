import type { ComponentType } from 'react'
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
  extends
    Omit<RadioGroupProps, 'value' | 'onChange' | 'options' | 'isInvalid' | 'defaultValue'>,
    UseFieldProps<TValue> {
  options: GenericRadioGroupOption<TValue>[]
  convertValueToString?: (value: TValue) => string
  FieldComponent?: ComponentType<RadioGroupProps>
}

export const RadioGroupField = <TValue = string,>({
  rules,
  defaultValue,
  name,
  control,
  errorMessage,
  isRequired,
  onChange: onChangeFromProps,
  transform,
  options,
  convertValueToString,
  description,
  onBlur,
  inputRef,
  FieldComponent,
  ...radioGroupProps
}: RadioGroupFieldProps<TValue>) => {
  const Components = useComponentContext()
  const { value, onChange, ...fieldProps } = useField<TValue>({
    name,
    control,
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

  const RenderComponent = FieldComponent ?? Components.RadioGroup
  return <RenderComponent {...radioGroupProps} {...fieldProps} {...stringFieldProps} />
}
