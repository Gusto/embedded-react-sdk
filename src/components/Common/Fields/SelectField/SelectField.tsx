import { useMemo } from 'react'
import type { UseFieldReturn } from '@/components/Common/Fields/hooks/useField'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { SelectOption, SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  useStringifyGenericFieldValue,
  type OptionWithGenericValue,
} from '@/components/Common/Fields/hooks/useStringifyGenericFieldValue'
import { processDescription } from '@/components/Common/Fields/helpers/processDescription'

type GenericSelectOption<TValue> = OptionWithGenericValue<TValue, SelectOption>

export interface SelectFieldProps<TValue = string>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'options' | 'isInvalid'>,
    UseFieldProps<TValue, HTMLButtonElement> {
  options: GenericSelectOption<TValue>[]
  convertValueToString?: (value: TValue) => string
  description?: React.ReactNode
  renderInput?: (props: UseFieldReturn & { options: SelectProps['options'] }) => React.ReactNode
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
  renderInput,
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
    onBlur,
    inputRef,
  })

  const stringFieldProps = useStringifyGenericFieldValue<TValue, SelectOption>({
    options,
    value,
    onChange,
    convertValueToString,
  })

  const processedDescription = useMemo(() => processDescription(description), [description])

  return renderInput ? (
    renderInput({ ...fieldProps, ...stringFieldProps })
  ) : (
    <Components.Select
      {...selectProps}
      {...fieldProps}
      {...stringFieldProps}
      description={processedDescription}
    />
  )
}
