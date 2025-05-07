import { Input as AriaInput } from 'react-aria-components'
import classNames from 'classnames'
import styles from './Input.module.scss'
import type { InputProps } from './InputTypes'
import AlertCircle from '@/assets/icons/alert-circle.svg?react'

export function Input({
  className,
  adornmentStart,
  adornmentEnd,
  inputRef,
  isDisabled,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
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
        <AriaInput ref={inputRef} disabled={isDisabled} aria-invalid={ariaInvalid} {...props} />
        <div className={styles.invalidIcon}>
          <AlertCircle fontSize={16} />
        </div>
      </div>
      {adornmentEnd && <div className={styles.adornmentEnd}>{adornmentEnd}</div>}
    </div>
  )
}
