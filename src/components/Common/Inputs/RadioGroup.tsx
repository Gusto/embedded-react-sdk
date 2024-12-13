import { RefAttributes } from 'react'
import {
  RadioGroup as AriaRadioGroup,
  FieldError,
  Label,
  Text,
  type RadioGroupProps as AriaRadioGroupProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'

type RadioGroupProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string | React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  children: React.ReactNode
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
  AriaRadioGroupProps &
  RefAttributes<HTMLDivElement>

export function RadioGroup<C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  children,
  ...props
}: RadioGroupProps<C, N>) {
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <AriaRadioGroup
      {...field}
      {...props}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      <div className="input-text-stack">
        {label ? <Label>{label}</Label> : null}
        {description ? <Text slot="description">{description}</Text> : null}
      </div>
      {children}
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </AriaRadioGroup>
  )
}
