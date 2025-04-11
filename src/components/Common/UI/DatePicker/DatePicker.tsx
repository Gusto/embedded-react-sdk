import type { InputHTMLAttributes, FocusEvent } from 'react'
import { useRef } from 'react'
import {
  DatePicker as AriaDatePicker,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
  type DateValue,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { CalendarDate } from '@internationalized/date'
import type { SharedFieldLayoutProps } from '../FieldLayout'
import { FieldLayout } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './DatePicker.module.scss'
import { useTheme } from '@/contexts/ThemeProvider'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import CaretRight from '@/assets/icons/caret-right.svg?react'
import CaretLeft from '@/assets/icons/caret-left.svg?react'

// Utility functions to convert between Date and DateValue
function dateToDateValue(date: Date | null | undefined): DateValue | null {
  if (!date) return null

  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1, // JavaScript months are 0-indexed
    date.getDate(),
  )
}

function dateValueToDate(dateValue: DateValue | null): Date | null {
  if (!dateValue) return null

  return new Date(
    dateValue.year,
    dateValue.month - 1, // DateValue months are 1-indexed
    dateValue.day,
  )
}

export interface DatePickerProps
  extends SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name'> {
  isDisabled?: boolean
  isInvalid?: boolean
  onChange?: (value: Date | null) => void
  onBlur?: (e: FocusEvent) => void
  label: string
  value?: Date
  placeholder?: string
}

export const DatePicker = ({
  className,
  description,
  errorMessage,
  id,
  isDisabled,
  isInvalid,
  isRequired,
  label,
  onChange,
  onBlur,
  value,
  ...props
}: DatePickerProps) => {
  const { t } = useTranslation()
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })
  const { container } = useTheme()
  const dateInputContainerRef = useRef<HTMLDivElement | null>(null)

  // Convert JavaScript Date to DateValue for internal use
  const internalValue = dateToDateValue(value)

  // Handle internal onChange to convert DateValue back to Date
  const handleChange = (dateValue: DateValue | null) => {
    if (onChange) {
      onChange(dateValueToDate(dateValue))
    }
  }

  return (
    <FieldLayout
      label={label}
      htmlFor={inputId}
      errorMessage={errorMessage}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      isRequired={isRequired}
      description={description}
      className={classNames(styles.root, className)}
    >
      <div ref={dateInputContainerRef} className={styles.container}>
        <AriaDatePicker
          aria-label={label}
          aria-describedby={ariaDescribedBy}
          id={inputId}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          value={internalValue}
          onChange={handleChange}
          {...props}
        >
          <Group>
            <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
            <Button onBlur={onBlur}>
              <div aria-hidden="true">
                <CaretDown title={t('icons.calendarArrow')} />
              </div>
            </Button>
          </Group>
          <Popover UNSTABLE_portalContainer={container.current} maxHeight={320}>
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
        </AriaDatePicker>
      </div>
    </FieldLayout>
  )
}
