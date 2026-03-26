import { useCallback, useMemo, useRef, useState } from 'react'
import type { Key } from 'react-aria-components'
import {
  ComboBox as AriaComboBox,
  Button,
  Input,
  ListBox,
  ListBoxItem,
  ListLayout,
  Popover,
  Virtualizer,
} from 'react-aria-components'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './MultiSelectComboBox.module.scss'
import type { MultiSelectComboBoxProps } from './MultiSelectComboBoxTypes'
import { FieldLayout } from '@/components/Common/FieldLayout'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useTheme } from '@/contexts/ThemeProvider'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'
import AlertCircle from '@/assets/icons/alert-circle.svg?react'
import CaretDown from '@/assets/icons/caret-down.svg?react'

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
  onBlur,
  onChange,
  options,
  placeholder,
  value: selectedValues = [],
  shouldVisuallyHideLabel,
}: MultiSelectComboBoxProps) {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const { container } = useTheme()
  const [inputValue, setInputValue] = useState('')
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useForkRef(inputRefFromProps, internalInputRef)

  const handleInputBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      blurTimeoutRef.current = null
      onBlur?.()
    }, 50)
  }, [onBlur])

  const handleInputFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }, [])

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const availableOptions = useMemo(
    () =>
      options
        .filter(option => !selectedSet.has(option.value))
        .map(option => ({
          label: option.label,
          value: option.value,
        })),
    [options, selectedSet],
  )

  const selectedOptions = useMemo(
    () => options.filter(option => selectedSet.has(option.value)),
    [options, selectedSet],
  )

  const items = useMemo(
    () => availableOptions.map(option => ({ name: option.label, id: option.value })),
    [availableOptions],
  )

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return
      onChange?.([...selectedValues, key.toString()])
      setInputValue('')
      internalInputRef.current?.blur()
    },
    [selectedValues, onChange],
  )

  const handleDismiss = useCallback(
    (value: string) => {
      onChange?.(selectedValues.filter(v => v !== value))
    },
    [selectedValues, onChange],
  )

  const loadingDescription = isLoading ? t('status.loadingOptions') : undefined
  const displayDescription = loadingDescription ?? description

  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description: displayDescription,
  })

  return (
    <div className={classNames(styles.root, className)}>
      <FieldLayout
        label={label}
        htmlFor={inputId}
        errorMessage={errorMessage}
        errorMessageId={errorMessageId}
        descriptionId={descriptionId}
        isRequired={isRequired}
        description={displayDescription}
        shouldVisuallyHideLabel={shouldVisuallyHideLabel}
        className={styles.comboBoxField}
        withErrorIcon={false}
      >
        <AriaComboBox
          aria-label={label}
          aria-describedby={ariaDescribedBy}
          className={'react-aria-ComboBox-root'}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          menuTrigger="focus"
          inputValue={inputValue}
          onInputChange={setInputValue}
          selectedKey={null}
          onSelectionChange={handleSelectionChange}
          id={inputId}
          name={name}
        >
          <Input
            ref={inputRef}
            placeholder={placeholder}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
          />
          <Button>
            <div aria-hidden="true" className={styles.icons}>
              {isInvalid && <AlertCircle fontSize={16} />}
              <CaretDown title={t('icons.selectArrow')} />
            </div>
          </Button>

          <Popover
            className={classNames(styles.popover, 'react-aria-Popover')}
            UNSTABLE_portalContainer={container.current}
            maxHeight={320}
          >
            <Virtualizer layout={ListLayout}>
              <ListBox items={items}>
                {item => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
              </ListBox>
            </Virtualizer>
          </Popover>
        </AriaComboBox>
      </FieldLayout>

      {selectedOptions.length > 0 && (
        <div className={styles.chips} role="list" aria-label={t('labels.selectedItems', { label })}>
          {selectedOptions.map(option => (
            <span key={option.value} role="listitem">
              <Components.Badge
                status="info"
                onDismiss={() => {
                  handleDismiss(option.value)
                }}
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
