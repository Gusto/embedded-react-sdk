import type React from 'react'
import type {
  RegisterOptions,
  FieldValues,
  ControllerRenderProps,
  ControllerFieldState,
} from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'

export interface FormFieldProps {
  name: string
  rules?: RegisterOptions
  defaultValue?: unknown
  label: string
  errorText?: string
  children: (
    field: ControllerRenderProps<FieldValues, string>,
    fieldState: ControllerFieldState,
    props: { label: string; errorText?: string },
  ) => React.ReactElement
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  errorText,
  name,
  rules,
  defaultValue,
  ...props
}) => {
  const { control } = useFormContext()
  const { field, fieldState } = useController({
    name,
    control,
    rules,
    defaultValue,
  })

  return children(field, fieldState, { label, errorText })
}
