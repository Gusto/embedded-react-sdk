import type { RefAttributes } from 'react'
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
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { createMarkup } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider'

type NumberFieldProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  placeholder?: string
  description?: string | React.ReactElement
  errorMessage?: string | ((validation: ValidationResult) => string)
  isRequired?: boolean
  style?: 'currency' | 'decimal' | 'percent'
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
  style,
  ...props
}: NumberFieldProps<C, N>) {
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control })
  const { currency } = useLocale()
  return (
    <AriaNumberField
      {...field}
      formatOptions={{ style: style === 'currency' ? 'currency' : 'decimal', currency }}
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
      <Group>
        <Input
          ref={ref => {
            field.ref(ref)
          }}
          placeholder={placeholder ? placeholder : undefined}
        />
        {style === 'percent' ? <span>%</span> : null}
      </Group>
      <FieldError>{errorMessage ?? error?.message}</FieldError>
    </AriaNumberField>
  )
}
