import { useContext, useId } from 'react'
// eslint-disable-next-line no-restricted-imports
import {
  DatePicker as AriaDatePicker,
  Group,
  Button,
  DateInput,
  DateSegment,
  Popover,
  Dialog,
  Calendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  CalendarStateContext,
  type DateValue,
} from 'react-aria-components'
import { CalendarDate } from '@internationalized/date'
import classNames from 'classnames'
import type { DatePickerProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './DatePicker.module.scss'

function toCalendarDate(d?: Date | null): CalendarDate | null {
  if (!d) return null
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function toNativeDate(value: DateValue): Date {
  return new Date(value.toDate('UTC'))
}

function CalendarTitle({ className }: { className?: string }) {
  const state = useContext(CalendarStateContext)
  if (!state) return null
  const date = state.focusedDate.toDate(state.timeZone)
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(date)
  return <h2 className={className}>{formatted}</h2>
}

export function DatePicker({
  id,
  name,
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  inputRef,
  onChange,
  onBlur,
  value,
  shouldVisuallyHideLabel,
  className,
  portalContainer,
  minDate,
  maxDate,
  isDateDisabled,
}: DatePickerProps) {
  const reactId = useId()
  const inputId = id ?? `il-datepicker-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const calendarValue = toCalendarDate(value)
  const minValue = toCalendarDate(minDate)
  const maxValue = toCalendarDate(maxDate)
  const hasValue = !!calendarValue

  return (
    <div
      className={classNames(styles.root, className)}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
      data-has-value={hasValue || undefined}
    >
      {description && (
        <span id={descriptionId} className={styles.visuallyHidden}>
          {description}
        </span>
      )}

      <AriaDatePicker
        aria-describedby={describedByIds}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        isRequired={isRequired}
        value={calendarValue}
        onChange={next => {
          onChange?.(next ? toNativeDate(next) : null)
        }}
        onBlur={onBlur}
        minValue={minValue ?? undefined}
        maxValue={maxValue ?? undefined}
        isDateUnavailable={isDateDisabled ? cd => isDateDisabled(toNativeDate(cd)) : undefined}
        className={styles.picker}
      >
        <Group
          className={classNames(styles.field, {
            [styles.fieldWithTooltip as string]: !!description,
          })}
        >
          <span className={styles.leadingIcon} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.8333 3.5H17.5V5.83333H10.5V3.5H8.16667V5.83333C6.23001 5.83333 4.66667 7.39667 4.66667 9.33333V10.5V12.8333V21C4.66667 22.9367 6.23001 24.5 8.16667 24.5H19.8333C21.77 24.5 23.3333 22.9367 23.3333 21V12.8333V10.5V9.33333C23.3333 7.39667 21.77 5.83333 19.8333 5.83333V3.5ZM21 9.33333C21 8.69167 20.475 8.16667 19.8333 8.16667H8.16667C7.52501 8.16667 7.00001 8.69167 7.00001 9.33333V10.5H21V9.33333ZM7.00001 12.8333V21C7.00001 21.6417 7.52501 22.1667 8.16667 22.1667H19.8333C20.475 22.1667 21 21.6417 21 21V12.8333H7.00001Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className={styles.valueArea}>
            <span
              className={classNames(styles.label, {
                [styles.labelHidden as string]: shouldVisuallyHideLabel,
              })}
            >
              {label}
              {!isRequired && <span className={styles.optional}> (optional)</span>}
            </span>
            <DateInput
              ref={inputRef as never}
              className={styles.dateInput}
              aria-label={typeof label === 'string' ? label : undefined}
            >
              {segment => <DateSegment segment={segment} className={styles.dateSegment} />}
            </DateInput>
          </span>
          <Button className={styles.calendarIcon} aria-label="Open calendar">
            <svg width="14" height="8" viewBox="0 0 14 8" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.70715 7.70711C7.31663 8.09763 6.68346 8.09763 6.29294 7.70711L0.29294 1.70711L1.70715 0.292892L7.00005 5.58579L12.2929 0.292893L13.7072 1.70711L7.70715 7.70711Z"
                fill="currentColor"
              />
            </svg>
          </Button>
          {description && (
            <span className={styles.tooltipFloat}>
              <InfoTooltip>{description}</InfoTooltip>
            </span>
          )}
          {name && (
            <input
              type="hidden"
              name={name}
              value={value ? value.toISOString().slice(0, 10) : ''}
            />
          )}
        </Group>

        <Popover
          className={styles.popover}
          UNSTABLE_portalContainer={portalContainer}
          offset={6}
          placement="bottom"
        >
          <Dialog className={styles.dialog}>
            <Calendar className={styles.calendar}>
              <header className={styles.calendarHeader}>
                <Button slot="previous" className={styles.navButton} aria-label="Previous month">
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12.2074 5.20654L6.41445 10.9995H20.0004V12.9995H6.41445L12.2074 18.7925L10.7934 20.2065L3.29336 12.7065C2.90288 12.316 2.90285 11.683 3.29336 11.2925L10.7934 3.79248L12.2074 5.20654Z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
                <CalendarTitle className={styles.calendarTitle} />
                <Button slot="next" className={styles.navButton} aria-label="Next month">
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M20.7075 11.2925C20.8949 11.4799 21.0004 11.7345 21.0005 11.9995C21.0005 12.2645 20.8948 12.519 20.7075 12.7065L13.2075 20.2065L11.7935 18.7925L17.5864 12.9995H4.00049V10.9995H17.5864L11.7935 5.20654L13.2075 3.79248L20.7075 11.2925Z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
              </header>
              <CalendarGrid className={styles.grid} weekdayStyle="short">
                <CalendarGridHeader className={styles.gridHeader}>
                  {day => (
                    <CalendarHeaderCell className={styles.dayHeader}>
                      {day.slice(0, 2)}
                    </CalendarHeaderCell>
                  )}
                </CalendarGridHeader>
                <CalendarGridBody>
                  {date => <CalendarCell date={date} className={styles.day} />}
                </CalendarGridBody>
              </CalendarGrid>
            </Calendar>
          </Dialog>
        </Popover>
      </AriaDatePicker>

      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
