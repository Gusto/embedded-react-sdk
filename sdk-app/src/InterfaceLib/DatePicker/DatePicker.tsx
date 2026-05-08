import { useContext, useId } from 'react'
// eslint-disable-next-line no-restricted-imports
import {
  DatePicker as AriaDatePicker,
  Group,
  Button,
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

function formatDisplay(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = String(date.getFullYear())
  return `${mm}/${dd}/${yyyy}`
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
        <Group className={styles.fieldWrapper}>
          <Button
            id={inputId}
            ref={inputRef as never}
            className={classNames(styles.field, {
              [styles.fieldWithTooltip as string]: !!description,
            })}
          >
            <span className={styles.valueArea}>
              <span
                className={classNames(styles.label, {
                  [styles.labelHidden as string]: shouldVisuallyHideLabel,
                })}
              >
                {label}
                {isRequired && <span aria-hidden="true"> *</span>}
              </span>
              <span className={styles.value}>
                {value ? (
                  formatDisplay(value)
                ) : (
                  <span className={styles.placeholder}>mm/dd/yyyy</span>
                )}
              </span>
            </span>
            <span className={styles.calendarIcon} aria-hidden="true">
              <svg width="14" height="8" viewBox="0 0 14 8" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.70715 7.70711C7.31663 8.09763 6.68346 8.09763 6.29294 7.70711L0.29294 1.70711L1.70715 0.292892L7.00005 5.58579L12.2929 0.292893L13.7072 1.70711L7.70715 7.70711Z"
                  fill="currentColor"
                />
              </svg>
            </span>
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
                      d="M20 11H7.83l4.59-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H20z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
                <CalendarTitle className={styles.calendarTitle} />
                <Button slot="next" className={styles.navButton} aria-label="Next month">
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M13 5l-1.41 1.41L16.17 11H4v2h12.17l-4.58 4.59L13 19l7-7z"
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
