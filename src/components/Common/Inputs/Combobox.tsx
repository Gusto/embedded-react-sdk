import type { RefAttributes } from 'react'
import {
  ComboBox as _ComboBox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
  type ComboBoxProps as AriaComboBoxProps,
} from 'react-aria-components'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { useTheme } from '@/contexts/ThemeProvider'

export interface ComboBoxItem {
  id: string
  name: string
}

type ComboBoxProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string
  errorMessage?: string
  isRequired?: boolean
  items: ComboBoxItem[]
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
  children,
  placeholder,
  ...props
}: ComboBoxProps<C, N>) {
  const { container } = useTheme()
  const {
    field,
    field: { onChange },
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <_ComboBox
      {...field}
      {...props}
      isInvalid={invalid}
      isRequired={isRequired}
      selectedKey={field.value ?? null}
      onSelectionChange={onChange}
      validationBehavior="aria"
    >
      {label ? <Label>{label}</Label> : null}
      {description ? <Text slot="description">{description}</Text> : null}
      <Input
        placeholder={placeholder}
        ref={ref => {
          field.ref(ref)
        }}
      />
      <Popover UNSTABLE_portalContainer={container.current}>
        <ListBox items={items}>
          {item => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
        </ListBox>
      </Popover>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </_ComboBox>
  )
}
