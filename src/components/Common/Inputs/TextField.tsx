import { RefAttributes } from 'react'
import {
  TextField as AriaTextField,
  FieldError,
  Input,
  InputProps,
  Label,
  Text,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'
import { createMarkup } from '@/helpers/formattedStrings'

type TextFieldProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string | React.ReactElement
  errorMessage?: string
  isRequired?: boolean
  type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'url'
  inputProps?: InputProps & RefAttributes<HTMLInputElement>
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
  AriaTextFieldProps &
  RefAttributes<HTMLDivElement>
export function TextField<C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  inputProps,
  type = 'text',
}: TextFieldProps<C, N>) {
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control })
  return (
    <AriaTextField
      {...field}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
      type={type}
    >
      <div className="input-text-stack">
        {label ? <Label>{label}</Label> : null}
        {description ? (
          typeof description === 'string' ? (
            <Text slot="description" dangerouslySetInnerHTML={createMarkup(description)} />
          ) : (
            <Text slot="description">{description}</Text>
          )
        ) : null}
      </div>
      <Input
        ref={ref => {
          field.ref(ref)
        }}
        {...inputProps}
      />
      <FieldError>{errorMessage ?? error?.message}</FieldError>
    </AriaTextField>
  )
}
