import type { RefAttributes } from 'react'
import {
  CheckboxGroup as AriaCheckboxGroup,
  FieldError,
  Label,
  Text,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
} from 'react-aria-components'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { DisconnectedCheckbox } from './Checkbox'
import { createMarkup } from '@/helpers/formattedStrings'

type CheckboxGroupItem = {
  name: string
  label: string | React.ReactNode
  isDisabled?: boolean
  description?: React.ReactNode
}

type CheckboxGroupProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string | React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  options: Array<CheckboxGroupItem>
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
      {(label || description) && (
        <div className="input-text-stack">
          {label && <Label>{label}</Label>}
          {description &&
            (typeof description === 'string' ? (
              <Text slot="description" dangerouslySetInnerHTML={createMarkup(description)} />
            ) : (
              <Text slot="description">{description}</Text>
            ))}
        </div>
      )}
      {options.map(({ name, label, isDisabled = false, description }) => (
        <DisconnectedCheckbox
          isDisabled={isDisabled}
          key={name}
          name={name}
          value={name}
          description={description}
        >
          {label}
        </DisconnectedCheckbox>
      ))}
      <FieldError>{errorMessage ?? error?.message}</FieldError>
    </AriaCheckboxGroup>
  )
}
