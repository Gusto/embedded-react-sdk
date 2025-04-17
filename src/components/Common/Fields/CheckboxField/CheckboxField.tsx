import type { ChangeEvent } from 'react'
import { useField, type UseFieldProps } from '@/components/Common/Fields/hooks/useField'
import { Checkbox } from '@/components/Common/UI/Checkbox'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'

export interface CheckboxFieldProps
  extends Omit<CheckboxProps, 'name' | 'value'>,
    UseFieldProps<ChangeEvent<HTMLInputElement>, boolean> {}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  rules,
  defaultValue,
  name,
  errorMessage,
  isRequired,
  onChange,
  transform,
  ...checkboxProps
}: CheckboxFieldProps) => {
  const { value, ...fieldProps } = useField({
    name,
    rules,
    defaultValue,
    errorMessage,
    isRequired,
    onChange,
    transform,
  })

  return <Checkbox {...fieldProps} {...checkboxProps} checked={value} />
}
