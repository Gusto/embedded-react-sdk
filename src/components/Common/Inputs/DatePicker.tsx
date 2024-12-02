import { RefAttributes } from 'react'
import {
  DatePicker as AriaDatePicker,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  Text,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'
import { useTheme } from '@/contexts'
import CaretDown from '@/assets/caret-down.svg?react'

type DatePickerProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  description?: string | React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  value?: DateValue
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
  Omit<AriaDatePickerProps<DateValue>, 'value'> &
  RefAttributes<HTMLDivElement>

export function DatePicker<C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  value,
  ...props
}: DatePickerProps<C, N>) {
  const { container } = useTheme()
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <AriaDatePicker
      {...field}
      {...props}
      value={value || field.value}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      {label ? <Label>{label}</Label> : null}
      {description ? <Text slot="description">{description}</Text> : null}
      <Group>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        <Button>
          <div aria-hidden="true">
            <CaretDown />
          </div>
        </Button>
      </Group>
      <Popover UNSTABLE_portalContainer={container.current ?? undefined}>
        <Dialog>
          <Calendar>
            <header>
              <Button slot="previous">◀</Button>
              <Heading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </AriaDatePicker>
  )
}
