import { useId } from 'react'
import classNames from 'classnames'
// eslint-disable-next-line no-restricted-imports
import { Group, NumberField as AriaNumberField, Input as AriaInput } from 'react-aria-components'
import type { NumberInputProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './NumberInput.module.scss'

export function NumberInput({
  name,
  format,
  inputRef,
  id,
  value,
  description,
  errorMessage,
  isRequired,
  placeholder,
  isInvalid,
  isDisabled,
  onChange,
  onBlur,
  label,
  min,
  max,
  shouldVisuallyHideLabel,
  adornmentStart,
  adornmentEnd,
  className,
  maximumFractionDigits,
  minimumFractionDigits,
}: NumberInputProps) {
  const reactId = useId()
  const inputId = id ?? `il-numberinput-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const minValue = typeof min === 'string' ? Number(min) : min
  const maxValue = typeof max === 'string' ? Number(max) : max

  const formatOptions: Intl.NumberFormatOptions =
    format === 'currency'
      ? {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'narrowSymbol',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      : format === 'percent'
        ? {
            style: 'unit',
            unit: 'percent',
            unitDisplay: 'narrow',
            minimumFractionDigits,
            maximumFractionDigits,
          }
        : {
            style: 'decimal',
            minimumFractionDigits,
            maximumFractionDigits,
          }

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const hasValue = value !== undefined && !Number.isNaN(value)

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
        <AriaNumberField
          value={value}
          name={name}
          formatOptions={formatOptions}
          isInvalid={isInvalid}
          isDisabled={isDisabled}
          isRequired={isRequired}
          validationBehavior="aria"
          onChange={onChange}
          onBlur={onBlur}
          aria-labelledby=" "
          minValue={minValue}
          maxValue={maxValue}
          className={styles.numberField}
        >
          <Group
            className={classNames(styles.field, {
              [styles.fieldWithTooltip as string]: !!description,
            })}
            data-has-value={hasValue || undefined}
          >
            {adornmentStart && <span className={styles.adornmentStart}>{adornmentStart}</span>}

            <label htmlFor={inputId} className={styles.labelInputContainer}>
              <AriaInput
                id={inputId}
                ref={inputRef}
                placeholder={placeholder ?? ' '}
                aria-describedby={describedByIds}
                aria-invalid={isInvalid}
                className={styles.input}
              />
              <span
                className={classNames(styles.label, {
                  [styles.labelHidden as string]: shouldVisuallyHideLabel,
                })}
              >
                {label}
                {!isRequired && <span className={styles.optional}> (optional)</span>}
              </span>
            </label>

            {adornmentEnd && <span className={styles.adornmentEnd}>{adornmentEnd}</span>}
          </Group>
        </AriaNumberField>
        {description && (
          <span className={styles.tooltipFloat}>
            <InfoTooltip>{description}</InfoTooltip>
          </span>
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
