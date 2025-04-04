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

export interface TextInputProps extends FieldLayoutProps {
  name?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'url'
  inputRef?: Ref<HTMLInputElement>
  id?: string
  value?: string
  placeholder?: string
  isInvalid?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  className?: string
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
  id: providedLabelId,
  value,
  placeholder,
  onChange: onChangeFromTextInputProps,
  onBlur,
  inputProps,
  className,
}: TextInputProps) {
  const generatedLabelId = useId()
  const id = providedLabelId || generatedLabelId
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
      htmlFor={id}
      errorMessageId={generatedErrorMessageId}
      className={classNames(styles.root, className)}
    >
      <Input
        id={id}
        ref={inputRef}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        aria-describedby={generatedErrorMessageId}
        aria-invalid={isInvalid}
        {...restInputProps}
      />
    </FieldLayout>
  )
}
