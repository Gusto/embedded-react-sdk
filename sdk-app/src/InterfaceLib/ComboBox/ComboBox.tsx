import { useId, useMemo, useState } from 'react'
// eslint-disable-next-line no-restricted-imports
import {
  ComboBox as AriaComboBox,
  Button,
  Group,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from 'react-aria-components'
import classNames from 'classnames'
import type { ComboBoxProps } from '@gusto/embedded-react-sdk'
import { InfoTooltip } from '../InfoTooltip'
import styles from './ComboBox.module.scss'

const MAX_VISIBLE_OPTIONS = 50

export const ComboBox = ({
  allowsCustomValue,
  className,
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
  inputRef,
  shouldVisuallyHideLabel,
  name,
  portalContainer,
}: ComboBoxProps) => {
  const reactId = useId()
  const inputId = id ?? `il-combobox-${reactId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const items = useMemo(
    () => options.map(option => ({ name: option.label, id: option.value })),
    [options],
  )

  const [filterText, setFilterText] = useState('')

  const filteredItems = useMemo(() => {
    if (!filterText) return items.slice(0, MAX_VISIBLE_OPTIONS)
    const search = filterText.toLowerCase()
    const matches: typeof items = []
    for (const item of items) {
      if (item.name.toLowerCase().includes(search)) {
        matches.push(item)
        if (matches.length >= MAX_VISIBLE_OPTIONS) break
      }
    }
    return matches
  }, [items, filterText])

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
    >
      {description && (
        <span id={descriptionId} className={styles.visuallyHidden}>
          {description}
        </span>
      )}

      <AriaComboBox
        aria-label={typeof label === 'string' ? label : undefined}
        aria-describedby={describedByIds}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        isRequired={isRequired}
        menuTrigger="focus"
        allowsCustomValue={allowsCustomValue}
        id={inputId}
        name={name}
        className={styles.combobox}
        onOpenChange={isOpen => {
          if (!isOpen) setFilterText('')
        }}
        {...(allowsCustomValue
          ? {
              inputValue: value ?? '',
              onInputChange: (next: string) => {
                setFilterText(next)
                onChange?.(next)
              },
            }
          : {
              selectedKey: value ? (value as Key) : null,
              onSelectionChange: (key: Key | null) => {
                if (key !== null) onChange?.(key.toString())
              },
              onInputChange: setFilterText,
            })}
      >
        <div className={styles.fieldWrapper}>
          <Group
            className={classNames(styles.field, {
              [styles.fieldWithTooltip as string]: !!description,
            })}
          >
            <label htmlFor={inputId} className={styles.labelInputContainer}>
              <Input
                ref={inputRef}
                placeholder={placeholder ?? ' '}
                onBlur={onBlur}
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
            <Button className={styles.caretButton} aria-label="Toggle options">
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
          </Group>

          {description && (
            <span className={styles.tooltipFloat}>
              <InfoTooltip>{description}</InfoTooltip>
            </span>
          )}
        </div>

        <Popover className={styles.popover} UNSTABLE_portalContainer={portalContainer} offset={6}>
          <ListBox items={filteredItems} className={styles.listbox}>
            {item => (
              <ListBoxItem key={item.id} className={styles.option}>
                {item.name}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </AriaComboBox>

      {errorMessage && (
        <div id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
