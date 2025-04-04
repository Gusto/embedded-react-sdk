import type { RefAttributes } from 'react'
import { useEffect, useRef } from 'react'
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
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './DatePicker.module.scss'
import { useTheme } from '@/contexts/ThemeProvider'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import CaretRight from '@/assets/icons/caret-right.svg?react'
import CaretLeft from '@/assets/icons/caret-left.svg?react'

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
  const { t } = useTranslation()
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control })

  const dateInputContainerRef = useRef<HTMLDivElement | null>(null)
  const errorText = error?.message ? error.message : errorMessage

  // Sets ref to the first spin button in any input for hook forms focus handling
  useEffect(() => {
    if (dateInputContainerRef.current) {
      const spinButtons = dateInputContainerRef.current.querySelectorAll('[role="spinbutton"]')
      if (spinButtons.length > 0) {
        field.ref(spinButtons[0])
      }
    }
  }, [field])

  return (
    <div ref={dateInputContainerRef} className={styles.container}>
      <AriaDatePicker
        {...field}
        {...props}
        value={value || field.value}
        isInvalid={invalid}
        isRequired={isRequired}
        validationBehavior="aria"
      >
        <div className="input-text-stack">
          {label ? <Label>{label}</Label> : null}
          {description ? <Text slot="description">{description}</Text> : null}
        </div>
        <Group>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
          <Button>
            <div aria-hidden="true">
              <CaretDown title={t('icons.calendarArrow')} />
            </div>
          </Button>
        </Group>
        <Popover UNSTABLE_portalContainer={container.current}>
          <Dialog>
            <Calendar>
              <header>
                <Button slot="previous">
                  <CaretLeft title={t('icons.previousMonth')} />
                </Button>
                <Heading />
                <Button slot="next">
                  <CaretRight title={t('icons.nextMonth')} />
                </Button>
              </header>
              <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
            </Calendar>
          </Dialog>
        </Popover>
        {errorText ? <FieldError>{errorText}</FieldError> : null}
      </AriaDatePicker>
    </div>
  )
}
