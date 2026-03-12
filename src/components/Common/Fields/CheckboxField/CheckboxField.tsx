import type { ComponentType } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface CheckboxFieldProps
  extends Omit<CheckboxProps, 'name' | 'value' | 'isInvalid'>, UseFieldProps<boolean> {
  FieldComponent?: ComponentType<CheckboxProps>
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
  FieldComponent,
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
    description,
    onBlur,
    inputRef,
  })

  const Comp = FieldComponent ?? Components.Checkbox
  return <Comp {...checkboxProps} {...fieldProps} />
}
