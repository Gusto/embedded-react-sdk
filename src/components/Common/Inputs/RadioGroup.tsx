import { createMarkup } from '@/helpers/formattedStrings'
import { RefAttributes, useRef } from 'react'
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
      label: string
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
    <>
      <div className="input-text-stack">
        {label ? <Label htmlFor={field.name}>{label}</Label> : null}
        {description ? (
          typeof description === 'string' ? (
            <Text slot="description" dangerouslySetInnerHTML={createMarkup(description)} />
          ) : (
            <Text slot="description">{description}</Text>
          )
        ) : null}
      </div>
      <AriaRadioGroup
        {...field}
        {...props}
        name={field.name}
        isInvalid={invalid}
        isRequired={isRequired}
        validationBehavior="aria"
      >
        {children}
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      </AriaRadioGroup>
    </>
  )
}
