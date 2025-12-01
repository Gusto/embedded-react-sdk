import type { ChangeEvent } from 'react'
import { TextArea as AriaTextArea } from 'react-aria-components'
import classNames from 'classnames'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './TextArea.module.scss'
import type { TextAreaProps } from './TextAreaTypes'
import { TextAreaDefaults } from './TextAreaTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { FieldLayout } from '@/components/Common/FieldLayout'
import AlertCircle from '@/assets/icons/alert-circle.svg?react'

export function TextArea(rawProps: TextAreaProps) {
  const resolvedProps = applyMissingDefaults(rawProps, TextAreaDefaults)
  const {
    name,
    label,
    description,
    errorMessage,
    isRequired,
    inputRef,
    isInvalid,
    isDisabled,
    id,
    value,
    placeholder,
    rows,
    cols,
    onChange,
    onBlur,
    className,
    shouldVisuallyHideLabel,
    'aria-describedby': ariaDescribedByFromProps,
    ...otherProps
  } = resolvedProps
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
    ariaDescribedBy: ariaDescribedByFromProps,
  })

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value)
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
      className={className}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      withErrorIcon={false}
      {...otherProps}
    >
      <div className={classNames(styles.container)} data-disabled={isDisabled}>
        <div className={styles.textAreaContainer}>
          <AriaTextArea
            id={inputId}
            ref={inputRef}
            name={name}
            value={value}
            placeholder={placeholder}
            rows={rows}
            cols={cols}
            disabled={isDisabled}
            aria-describedby={ariaDescribedBy}
            aria-invalid={isInvalid}
            onChange={handleChange}
            onBlur={onBlur}
          />
          {isInvalid && (
            <div className={styles.invalidIcon}>
              <AlertCircle fontSize={16} />
            </div>
          )}
        </div>
      </div>
    </FieldLayout>
  )
}
