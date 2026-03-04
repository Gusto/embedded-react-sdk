import { useCallback, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import styles from './MultiSelectComboBox.module.scss'
import type {
  MultiSelectComboBoxOption,
  MultiSelectComboBoxProps,
} from './MultiSelectComboBoxTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'

export function MultiSelectComboBox({
  className,
  description,
  errorMessage,
  id,
  inputRef: inputRefFromProps,
  isDisabled,
  isInvalid,
  isLoading,
  isRequired,
  label,
  name,
  onChange,
  options,
  placeholder,
  value: selectedValues,
  shouldVisuallyHideLabel,
}: MultiSelectComboBoxProps) {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const [inputValue, setInputValue] = useState('')
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useForkRef(inputRefFromProps, internalInputRef)

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const formatOptionLabel = useCallback(
    (option: MultiSelectComboBoxOption) =>
      option.description ? `${option.label} — ${option.description}` : option.label,
    [],
  )

  const availableOptions = useMemo(
    () =>
      options
        .filter(option => !selectedSet.has(option.value))
        .map(option => ({
          label: formatOptionLabel(option),
          value: option.value,
        })),
    [options, selectedSet, formatOptionLabel],
  )

  const displayLabelToValueMap = useMemo(
    () => new Map(availableOptions.map(o => [o.label, o.value])),
    [availableOptions],
  )

  const selectedOptions = useMemo(
    () => options.filter(option => selectedSet.has(option.value)),
    [options, selectedSet],
  )

  const handleInputChange = useCallback(
    (text: string) => {
      const matchedValue = displayLabelToValueMap.get(text)
      if (matchedValue) {
        onChange([...selectedValues, matchedValue])
        setInputValue('')
        return
      }
      setInputValue(text)
    },
    [displayLabelToValueMap, selectedValues, onChange],
  )

  const dismissCallbacks = useMemo(
    () =>
      new Map(
        selectedOptions.map(option => [
          option.value,
          () => {
            onChange(selectedValues.filter(v => v !== option.value))
          },
        ]),
      ),
    [selectedOptions, selectedValues, onChange],
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
        <div className={styles.chips} role="list" aria-label={t('labels.selectedItems', { label })}>
          {selectedOptions.map(option => (
            <span key={option.value} role="listitem">
              <Components.Badge
                status="info"
                onDismiss={dismissCallbacks.get(option.value)}
                dismissAriaLabel={t('labels.removeItem', { label: option.label })}
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
