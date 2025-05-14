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
import { parseDate } from '@internationalized/date'
import { FieldLayout } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './DatePicker.module.scss'
import type { DatePickerProps } from './DatePickerTypes'
import { useTheme } from '@/contexts/ThemeProvider'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import CaretRight from '@/assets/icons/caret-right.svg?react'
import CaretLeft from '@/assets/icons/caret-left.svg?react'
import AlertCircle from '@/assets/icons/alert-circle.svg?react'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

function calendarDateValueToDate(dateValue: DateValue | null): Date | null {
  if (!dateValue) return null

  const date = new Date(
    dateValue.year,
    dateValue.month - 1, // DateValue months are 1-indexed
    dateValue.day,
  )

  return date
}

export const DatePicker = ({
  className,
  description,
  errorMessage,
  id,
  inputRef,
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

  // Convert JavaScript Date to DateValue for internal use
  // Format the date as YYYY-MM-DD for parseDate
  const formattedDate = value ? formatDateToStringDate(value) : ''
  const internalValue = formattedDate ? parseDate(formattedDate) : null

  // Handle internal onChange to convert DateValue back to Date
  const handleChange = (dateValue: DateValue | null) => {
    if (onChange) {
      onChange(calendarDateValueToDate(dateValue))
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
      withErrorIcon={false}
    >
      <div className={styles.container}>
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
            <DateInput ref={inputRef}>{segment => <DateSegment segment={segment} />}</DateInput>

            <div className={styles.icons}>
              {isInvalid && <AlertCircle aria-hidden="true" fontSize={16} />}
              <Button onBlur={onBlur}>
                <CaretDown title={t('icons.calendarArrow')} />
              </Button>
            </div>
          </Group>
          <Popover
            className={classNames(styles.popover, 'react-aria-Popover')}
            UNSTABLE_portalContainer={container.current}
          >
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
