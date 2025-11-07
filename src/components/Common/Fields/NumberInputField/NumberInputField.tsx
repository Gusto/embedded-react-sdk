import { useMemo } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { processDescription } from '@/components/Common/Fields/helpers/processDescription'

export interface NumberInputFieldProps
  extends Omit<NumberInputProps, 'name' | 'value' | 'isInvalid'>,
    UseFieldProps<number> {
  description?: React.ReactNode
}

export const NumberInputField: React.FC<NumberInputFieldProps> = ({
  rules: providedRules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  ...numberInputProps
}: NumberInputFieldProps) => {
  const Components = useComponentContext()
  const rules = {
    validate: (value: number) => {
      if (isRequired && isNaN(value)) {
        return false
      }
      return true
    },
    ...providedRules,
  }

  const fieldProps = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
    onBlur,
    inputRef,
  })

  const processedDescription = useMemo(() => processDescription(description), [description])

  return (
    <Components.NumberInput
      {...numberInputProps}
      {...fieldProps}
      description={processedDescription}
    />
  )
}
