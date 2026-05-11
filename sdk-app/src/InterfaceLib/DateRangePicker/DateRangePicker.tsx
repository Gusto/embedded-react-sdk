import { useId } from 'react'
import classNames from 'classnames'
import type { DateRangePickerProps } from '@gusto/embedded-react-sdk'
import styles from './DateRangePicker.module.scss'

function toInputValue(date: Date | undefined): string {
  if (!date) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function fromInputValue(value: string): Date | null {
  if (!value) return null
  const [yyyy, mm, dd] = value.split('-').map(Number)
  if (!yyyy || !mm || !dd) return null
  return new Date(yyyy, mm - 1, dd)
}

export function DateRangePicker({
  label,
  shouldVisuallyHideLabel,
  value,
  onChange,
  startDateLabel,
  endDateLabel,
  minValue,
  maxValue,
}: DateRangePickerProps) {
  const reactId = useId()
  const startId = `il-daterange-start-${reactId}`
  const endId = `il-daterange-end-${reactId}`

  const min = toInputValue(minValue) || undefined
  const max = toInputValue(maxValue) || undefined

  const handleChange = (next: { start: Date | null; end: Date | null }) => {
    if (next.start && next.end) {
      onChange({ start: next.start, end: next.end })
    } else {
      onChange(null)
    }
  }

  const handleStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const start = fromInputValue(event.target.value)
    handleChange({ start, end: value?.end ?? null })
  }

  const handleEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const end = fromInputValue(event.target.value)
    handleChange({ start: value?.start ?? null, end })
  }

  return (
    <div className={styles.root}>
      <span
        className={classNames(styles.groupLabel, {
          [styles.groupLabelHidden as string]: shouldVisuallyHideLabel,
        })}
      >
        {label}
      </span>
      <div className={styles.fields}>
        <label htmlFor={startId} className={styles.field}>
          <span className={styles.fieldLabel}>{startDateLabel}</span>
          <input
            id={startId}
            type="date"
            value={toInputValue(value?.start)}
            min={min}
            max={max}
            onChange={handleStartChange}
            className={styles.input}
          />
        </label>
        <span className={styles.separator} aria-hidden="true">
          →
        </span>
        <label htmlFor={endId} className={styles.field}>
          <span className={styles.fieldLabel}>{endDateLabel}</span>
          <input
            id={endId}
            type="date"
            value={toInputValue(value?.end)}
            min={min}
            max={max}
            onChange={handleEndChange}
            className={styles.input}
          />
        </label>
      </div>
    </div>
  )
}
