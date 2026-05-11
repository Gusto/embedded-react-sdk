import { useId, useMemo } from 'react'
import classNames from 'classnames'
// eslint-disable-next-line no-restricted-imports
import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
  type Key,
} from 'react-aria-components'
import type { SelectProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './Select.module.scss'

export const Select = ({
  description,
  errorMessage,
  id,
  isDisabled,
  isInvalid,
  isRequired,
  label,
  onChange,
  onBlur,
  options,
  placeholder,
  value,
  shouldVisuallyHideLabel,
  name,
  className,
  inputRef,
  portalContainer,
}: SelectProps) => {
  const reactId = useId()
  const inputId = id ?? `il-select-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const items = useMemo(() => options.map(o => ({ name: o.label, id: o.value })), [options])

  const describedByIds =
    [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  const hasValue = value !== undefined && value !== null && value !== ''

  return (
    <div
      className={classNames(styles.root, className)}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
      data-has-value={hasValue || undefined}
      data-no-label={shouldVisuallyHideLabel || !label || undefined}
    >
      <AriaSelect
        aria-label={typeof label === 'string' ? label : undefined}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        onSelectionChange={key => {
          if (key != null) onChange?.(key.toString())
        }}
        onBlur={onBlur}
        id={inputId}
        selectedKey={value ? (value as Key) : null}
        aria-describedby={describedByIds}
        name={name}
        className={styles.select}
      >
        <div className={styles.triggerWrapper}>
          <Button
            ref={inputRef}
            className={classNames(styles.trigger, {
              [styles.triggerWithTooltip as string]: !!description,
            })}
          >
            <span className={styles.valueArea}>
              <label
                htmlFor={inputId}
                className={classNames(styles.label, {
                  [styles.labelHidden as string]: shouldVisuallyHideLabel,
                })}
              >
                {label}
                {!isRequired && <span className={styles.optional}> (optional)</span>}
              </label>
              <span className={styles.value}>
                <SelectValue>
                  {({ isPlaceholder, defaultChildren }) =>
                    isPlaceholder ? (placeholder ?? '\u00A0') : defaultChildren
                  }
                </SelectValue>
              </span>
            </span>
            <span className={styles.caret} aria-hidden="true">
              <svg width="14" height="8" viewBox="0 0 14 8" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.70715 7.70711C7.31663 8.09763 6.68346 8.09763 6.29294 7.70711L0.29294 1.70711L1.70715 0.292892L7.00005 5.58579L12.2929 0.292893L13.7072 1.70711L7.70715 7.70711Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </Button>
          {description && (
            <span className={styles.tooltipFloat}>
              <InfoTooltip>{description}</InfoTooltip>
            </span>
          )}
        </div>
        {description && (
          <span id={descriptionId} className={styles.visuallyHidden}>
            {description}
          </span>
        )}
        <Popover
          className={styles.popover}
          UNSTABLE_portalContainer={portalContainer}
          maxHeight={320}
        >
          <ListBox items={items} className={styles.listbox}>
            {item => (
              <ListBoxItem key={item.id} className={styles.option}>
                {item.name}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </AriaSelect>

      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
