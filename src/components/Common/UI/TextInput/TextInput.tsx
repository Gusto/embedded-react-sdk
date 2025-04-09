import type { Ref, InputHTMLAttributes, ChangeEvent } from 'react'
import { Input } from 'react-aria-components'
import classNames from 'classnames'
import { FieldLayout, type SharedFieldLayoutProps } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './TextInput.module.scss'

export interface TextInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'type' | 'onChange' | 'onBlur'
    > {
  inputRef?: Ref<HTMLInputElement>
  value?: string
  isInvalid?: boolean
  isDisabled?: boolean
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export function TextInput({
  name,
  label,
  description,
  errorMessage,
  isRequired,
  type = 'text',
  inputRef,
  isInvalid = false,
  isDisabled = false,
  id,
  value,
  placeholder,
  onChange: onChangeFromTextInputProps,
  onBlur,
  inputProps,
  className,
  shouldVisuallyHideLabel,
  ...props
}: TextInputProps) {
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const { onChange: onChangeFromInputProps, ...restInputProps } = inputProps ?? {}

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeFromTextInputProps?.(event)
    onChangeFromInputProps?.(event)
  }

  return (
    <FieldLayout
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      htmlFor={inputId}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      className={classNames(styles.root, className)}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      {...props}
    >
      <Input
        id={inputId}
        ref={inputRef}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isInvalid}
        disabled={isDisabled}
        {...restInputProps}
      />
    </FieldLayout>
  )
}
