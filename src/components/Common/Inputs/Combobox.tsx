import { RefAttributes } from 'react'
import {
  ComboBox as AriaComboBox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
  type ComboBoxProps as AriaComboBoxProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'

type ComboBoxProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string
  errorMessage?: string
  isRequired?: boolean
  items: { id: string; name: string }[]
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
  AriaComboBoxProps<object & { id: string; name: string }> &
  RefAttributes<HTMLDivElement>

export function ComboBox<C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  items,
  placeholder,
  ...props
}: ComboBoxProps<C, N>) {
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <AriaComboBox
      {...field}
      {...props}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      {label ? <Label>{label}</Label> : null}
      {description ? <Text slot="description">{description}</Text> : null}
      <Input placeholder={placeholder} />
      <Popover>
        <ListBox>
          {items.map(item => (
            <ListBoxItem key={item.id}>{item.name}</ListBoxItem>
          ))}
        </ListBox>
      </Popover>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </AriaComboBox>
  )
}
