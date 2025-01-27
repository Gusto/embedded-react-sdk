import { createMarkup } from '@/helpers/formattedStrings'
import { RefAttributes } from 'react'
import {
  CheckboxGroup as AriaCheckboxGroup,
  FieldError,
  Label,
  Text,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'
import { DisconnectedCheckbox } from './Checkbox'

type CheckboxGroupProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string | React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  options: Array<{ value: string; label: string | React.ReactNode; isDisabled?: boolean }>
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
  AriaCheckboxGroupProps &
  RefAttributes<HTMLDivElement>

export function CheckboxGroup<C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  options,
  ...props
}: CheckboxGroupProps<C, N>) {
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control })

  return (
    <AriaCheckboxGroup
      {...field}
      {...props}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
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
      {options.map(({ value, label, isDisabled = false }) => (
        <DisconnectedCheckbox isDisabled={isDisabled} key={value} value={value}>
          {label}
        </DisconnectedCheckbox>
      ))}
      <FieldError>{errorMessage ?? error?.message}</FieldError>
    </AriaCheckboxGroup>
  )
}
