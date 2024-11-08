import { RefAttributes } from 'react'
import {
  NumberField as AriaNumberField,
  FieldError,
  Input,
  Label,
  Text,
  Group,
  type NumberFieldProps as AriaNumberFieldProps,
  type ValidationResult,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'

type NumberFieldProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: React.ReactNode
  errorMessage?: string | ((validation: ValidationResult) => string)
  isRequired?: boolean
  isPercent?: boolean
  placeholder?: string
} & (
  | {
      label?: string
      'aria-label'?: never
    }
  | {
      'aria-label': string
      label?: never
    }
) &
  AriaNumberFieldProps &
  RefAttributes<HTMLDivElement>

export function NumberField<C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  placeholder,
  ...props
}: NumberFieldProps<C, N>) {
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <AriaNumberField
      {...field}
      {...props}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      {label ? <Label>{label}</Label> : null}
      {description ? <Text slot="description">{description}</Text> : null}
      <Group>
        <Input placeholder={placeholder ?? ''} />
      </Group>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </AriaNumberField>
  )
}
