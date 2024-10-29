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
  isPercent,
  ...props
}: NumberFieldProps<C, N>) {
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  const value = isPercent && field.value ? field.value / 100 : field.value

  return (
    <AriaNumberField
      {...field}
      {...props}
      value={value}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
      formatOptions={{ style: isPercent ? 'percent' : 'decimal' }}
    >
      {label ? <Label>{label}</Label> : null}
      {description ? <Text slot="description">{description}</Text> : null}
      <Group>
        <Input />
      </Group>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </AriaNumberField>
  )
}
