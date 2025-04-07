import type {
  Ref,
  InputHTMLAttributes,
  ChangeEventHandler,
  FocusEventHandler,
  ChangeEvent,
} from 'react'
import { Input } from 'react-aria-components'
import { useId } from 'react'
import classNames from 'classnames'
import { FieldLayout, type FieldLayoutProps } from '../FieldLayout'
import styles from './TextInput.module.scss'

export interface TextInputProps
  extends FieldLayoutProps,
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
  id: providedInputId,
  value,
  placeholder,
  onChange: onChangeFromTextInputProps,
  onBlur,
  inputProps,
  className,
}: TextInputProps) {
  const generatedInputId = useId()
  const inputId = providedInputId || generatedInputId
  const generatedErrorMessageId = useId()

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
      errorMessageId={generatedErrorMessageId}
      className={classNames(styles.root, className)}
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
        aria-describedby={generatedErrorMessageId}
        aria-invalid={isInvalid}
        disabled={isDisabled}
        {...restInputProps}
      />
    </FieldLayout>
  )
}
