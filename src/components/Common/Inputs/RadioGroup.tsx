import { RefAttributes } from 'react'
import {
  RadioGroup as AriaRadioGroup,
  FieldError,
  Label,
  Radio,
  Text,
  type RadioGroupProps as AriaRadioGroupProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'
import { createMarkup } from '@/helpers/formattedStrings'

type RadioGroupItem = {
  value: string
  label: string | React.ReactNode
}

type RadioGroupProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string | React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  options?: Array<RadioGroupItem>
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
  options,
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
        onChange={(value: string) => {
          field.onChange(value)
          props.onChange?.(value)
        }}
        name={field.name}
        isInvalid={invalid}
        isRequired={isRequired}
        validationBehavior="aria"
      >
        {options &&
          options.map(({ value, label }) => (
            <Radio key={value} value={value}>
              {label}
            </Radio>
          ))}
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      </AriaRadioGroup>
    </>
  )
}
