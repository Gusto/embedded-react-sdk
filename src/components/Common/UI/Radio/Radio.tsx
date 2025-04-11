import type { Ref, InputHTMLAttributes, ChangeEvent } from 'react'
import classNames from 'classnames'
import { useFieldIds } from '../hooks/useFieldIds'
import {
  HorizontalFieldLayout,
  type SharedHorizontalFieldLayoutProps,
} from '../HorizontalFieldLayout'
import styles from './Radio.module.scss'

export interface RadioProps
  extends SharedHorizontalFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'className' | 'onChange' | 'onBlur' | 'checked' | 'value'
    > {
  inputRef?: Ref<HTMLInputElement>
  isInvalid?: boolean
  isDisabled?: boolean
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export const Radio = ({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  inputRef,
  checked,
  value,
  isInvalid = false,
  isDisabled = false,
  id,
  onChange: onChangeFromRadioProps,
  onBlur,
  inputProps,
  className,
  ...props
}: RadioProps) => {
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const { onChange: onChangeFromInputProps, ...restInputProps } = inputProps ?? {}

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeFromRadioProps?.(event)
    onChangeFromInputProps?.(event)
  }

  return (
    <HorizontalFieldLayout
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      htmlFor={inputId}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      className={className}
      {...props}
    >
      <div className={styles.radioWrapper}>
        <input
          type="radio"
          name={name}
          disabled={isDisabled}
          aria-describedby={ariaDescribedBy}
          checked={checked}
          id={inputId}
          ref={inputRef}
          onBlur={onBlur}
          onChange={handleChange}
          value={value}
          className={styles.radioInput}
          {...restInputProps}
        />
        <div className={classNames(styles.radio, { [styles.checked as string]: checked })}>
          {checked && <div className={styles.radioDot} />}
        </div>
      </div>
    </HorizontalFieldLayout>
  )
}
