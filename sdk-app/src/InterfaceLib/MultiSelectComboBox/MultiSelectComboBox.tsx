import { useId, useMemo, useState, type ChangeEvent } from 'react'
import classNames from 'classnames'
import type { MultiSelectComboBoxProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './MultiSelectComboBox.module.scss'

export function MultiSelectComboBox({
  className,
  description,
  errorMessage,
  id,
  isDisabled = false,
  isInvalid = false,
  isLoading = false,
  isRequired,
  label,
  name,
  onChange,
  onBlur,
  options,
  placeholder,
  shouldVisuallyHideLabel,
  value = [],
  inputRef,
}: MultiSelectComboBoxProps) {
  const reactId = useId()
  const inputId = id ?? `il-multicombobox-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const filteredOptions = useMemo(
    () =>
      options.filter(option => option.label.toLowerCase().includes(filter.trim().toLowerCase())),
    [options, filter],
  )

  const selectedSet = useMemo(() => new Set(value), [value])

  const toggle = (optionValue: string) => {
    const next = selectedSet.has(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange?.(next)
  }

  const removeChip = (optionValue: string) => {
    onChange?.(value.filter(v => v !== optionValue))
  }

  const selectedOptions = useMemo(
    () => value.map(v => options.find(o => o.value === v)).filter(Boolean),
    [value, options],
  )

  return (
    <div
      className={classNames(styles.root, className)}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
    >
      {description && (
        <span id={descriptionId} className={styles.visuallyHidden}>
          {description}
        </span>
      )}

      <div className={styles.fieldWrapper}>
        <div className={styles.field}>
          <label
            htmlFor={inputId}
            className={classNames(styles.label, {
              [styles.labelHidden as string]: shouldVisuallyHideLabel,
            })}
          >
            {label}
            {!isRequired && <span className={styles.optional}> (optional)</span>}
          </label>

          <div className={styles.chipsRow}>
            {selectedOptions.map(option => (
              <span key={option!.value} className={styles.chip}>
                {option!.label}
                <button
                  type="button"
                  onClick={() => {
                    removeChip(option!.value)
                  }}
                  disabled={isDisabled}
                  className={styles.chipRemove}
                  aria-label={`Remove ${option!.label}`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path
                      d="M1 1l8 8M9 1l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
            <input
              id={inputId}
              ref={inputRef}
              name={name}
              value={filter}
              placeholder={selectedOptions.length === 0 ? (placeholder ?? '') : ''}
              disabled={isDisabled}
              aria-invalid={isInvalid}
              aria-required={isRequired}
              aria-describedby={describedByIds}
              aria-expanded={open}
              aria-controls={`${inputId}-list`}
              role="combobox"
              autoComplete="off"
              onFocus={() => {
                setOpen(true)
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  setOpen(false)
                }, 100)
                onBlur?.()
              }}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFilter(event.target.value)
                setOpen(true)
              }}
              className={styles.input}
            />
          </div>
        </div>
        {description && (
          <span className={styles.tooltipFloat}>
            <InfoTooltip>{description}</InfoTooltip>
          </span>
        )}

        {open && (
          <ul id={`${inputId}-list`} role="listbox" className={styles.listbox}>
            {isLoading && <li className={styles.loading}>Loading…</li>}
            {!isLoading && filteredOptions.length === 0 && (
              <li className={styles.empty}>No options</li>
            )}
            {!isLoading &&
              filteredOptions.map(option => {
                const checked = selectedSet.has(option.value)
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={checked}
                    onMouseDown={event => {
                      event.preventDefault()
                      toggle(option.value)
                    }}
                    className={classNames(styles.option, {
                      [styles.optionSelected as string]: checked,
                    })}
                  >
                    {option.label}
                  </li>
                )
              })}
          </ul>
        )}
      </div>

      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
