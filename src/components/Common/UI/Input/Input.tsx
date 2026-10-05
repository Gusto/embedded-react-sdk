import { Input as AriaInput } from 'react-aria-components'
import type { KeyboardEvent } from 'react'
import classNames from 'classnames'
import styles from './Input.module.scss'
import type { InputProps } from './InputTypes'
import { InputDefaults } from './InputTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import AlertCircle from '@/assets/icons/alert-circle.svg?react'

/**
 * Low-level text input primitive with optional start and end adornments.
 *
 * @remarks
 * The building block used by higher-level field components such as TextInput
 * and NumberInput. Most consumers should reach for those instead.
 *
 * @internal
 */
export function Input(rawProps: InputProps) {
  const resolvedProps = applyMissingDefaults(rawProps, InputDefaults)
  const {
    className,
    adornmentStart,
    adornmentEnd,
    inputRef,
    isDisabled,
    'aria-invalid': ariaInvalid,
    ...otherProps
  } = resolvedProps

  // A native <input type="number"> still accepts the scientific-notation
  // characters "e"/"E". They are never valid in our numeric fields and are
  // silently dropped when the value is saved (the DOM coerces a lone "e" to an
  // empty string), so block them at the keystroke instead.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (otherProps.type === 'number' && (event.key === 'e' || event.key === 'E')) {
      event.preventDefault()
    }
  }

  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.hasAdornmentStart as string]: !!adornmentStart,
          [styles.hasAdornmentEnd as string]: !!adornmentEnd,
        },
        className,
      )}
      data-disabled={isDisabled}
    >
      {adornmentStart && <div className={styles.adornmentStart}>{adornmentStart}</div>}
      <div className={styles.inputContainer}>
        <AriaInput
          ref={inputRef}
          disabled={isDisabled}
          aria-invalid={ariaInvalid}
          onKeyDown={handleKeyDown}
          {...otherProps}
        />
        <div className={styles.invalidIcon}>
          <AlertCircle fontSize={16} />
        </div>
      </div>
      {adornmentEnd && <div className={styles.adornmentEnd}>{adornmentEnd}</div>}
    </div>
  )
}
