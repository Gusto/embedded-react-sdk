import { useMemo } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { processDescription } from '@/components/Common/Fields/helpers/processDescription'

export interface CheckboxFieldProps
  extends Omit<CheckboxProps, 'name' | 'value' | 'isInvalid'>,
    UseFieldProps<boolean> {
  description?: React.ReactNode
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  description,
  onBlur,
  inputRef,
  ...checkboxProps
}: CheckboxFieldProps) => {
  const Components = useComponentContext()
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
    <Components.Checkbox {...checkboxProps} {...fieldProps} description={processedDescription} />
  )
}
