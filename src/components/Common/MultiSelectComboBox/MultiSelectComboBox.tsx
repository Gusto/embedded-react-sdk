import { useCallback, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './MultiSelectComboBox.module.scss'
import type { MultiSelectComboBoxProps } from './MultiSelectComboBoxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function MultiSelectComboBox({
  className,
  description,
  errorMessage,
  id,
  isDisabled,
  isInvalid,
  isLoading,
  isRequired,
  label,
  name,
  onSelectionChange,
  options,
  placeholder,
  selectedValues,
  shouldVisuallyHideLabel,
}: MultiSelectComboBoxProps) {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const availableOptions = useMemo(
    () =>
      options
        .filter(option => !selectedSet.has(option.value))
        .map(option => ({
          label: option.description ? `${option.label} — ${option.description}` : option.label,
          value: option.value,
        })),
    [options, selectedSet],
  )

  const labelToValueMap = useMemo(
    () => new Map(availableOptions.map(o => [o.label, o.value])),
    [availableOptions],
  )

  const selectedOptions = useMemo(
    () => options.filter(option => selectedSet.has(option.value)),
    [options, selectedSet],
  )

  const handleInputChange = useCallback(
    (text: string) => {
      const matchedValue = labelToValueMap.get(text)
      if (matchedValue) {
        onSelectionChange([...selectedValues, matchedValue])
        setInputValue('')
        inputRef.current?.blur()
        return
      }
      setInputValue(text)
    },
    [labelToValueMap, selectedValues, onSelectionChange],
  )

  const handleRemove = useCallback(
    (value: string) => {
      onSelectionChange(selectedValues.filter(v => v !== value))
    },
    [onSelectionChange, selectedValues],
  )

  const loadingDescription = isLoading ? t('status.loadingOptions') : undefined

  return (
    <div className={classNames(styles.root, className)}>
      <Components.ComboBox
        id={id}
        name={name}
        label={label}
        shouldVisuallyHideLabel={shouldVisuallyHideLabel}
        description={loadingDescription ?? description}
        errorMessage={errorMessage}
        isRequired={isRequired}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        allowsCustomValue
        value={inputValue}
        onChange={handleInputChange}
        options={availableOptions}
        placeholder={placeholder}
        inputRef={inputRef}
      />

      {selectedOptions.length > 0 && (
        <div className={styles.chips} role="list" aria-label={`Selected ${label}`}>
          {selectedOptions.map(option => (
            <span key={option.value} role="listitem">
              <Components.Badge
                status="info"
                onDismiss={() => {
                  handleRemove(option.value)
                }}
                dismissAriaLabel={`Remove ${option.label}`}
                isDisabled={isDisabled}
              >
                {option.label}
              </Components.Badge>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
