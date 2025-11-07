import { useMemo } from 'react'
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
import { processDescription } from '@/components/Common/Fields/helpers/processDescription'

type GenericRadioGroupOption<TValue> = OptionWithGenericValue<TValue, RadioGroupOption>

export interface RadioGroupFieldProps<TValue>
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'options' | 'isInvalid' | 'defaultValue'>,
    UseFieldProps<TValue> {
  options: GenericRadioGroupOption<TValue>[]
  convertValueToString?: (value: TValue) => string
  description?: React.ReactNode
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
    onBlur,
    inputRef,
  })

  const stringFieldProps = useStringifyGenericFieldValue<TValue, RadioGroupOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  const processedDescription = useMemo(() => processDescription(description), [description])

  return (
    <Components.RadioGroup
      {...radioGroupProps}
      {...fieldProps}
      {...stringFieldProps}
      description={processedDescription}
    />
  )
}
