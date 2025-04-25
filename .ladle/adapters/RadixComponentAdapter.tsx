import React from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as RadioGroup from '@radix-ui/react-radio-group'
import * as Select from '@radix-ui/react-select'
import * as Switch from '@radix-ui/react-switch'
import * as Label from '@radix-ui/react-label'
import * as Dialog from '@radix-ui/react-dialog'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDownIcon, ChevronUpIcon, Cross2Icon, CheckIcon } from '@radix-ui/react-icons'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import type { FocusEventHandler } from 'react'
import type { TextInputProps } from '../../src/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '../../src/components/Common/UI/NumberInput/NumberInputTypes'
import type { ComboBoxProps } from '../../src/components/Common/UI/ComboBox/ComboBoxTypes'
import type { CheckboxProps } from '../../src/components/Common/UI/Checkbox/CheckboxTypes'
import type { DatePickerProps } from '../../src/components/Common/UI/DatePicker/DatePickerTypes'
import type { RadioProps } from '../../src/components/Common/UI/Radio/RadioTypes'
import type { SelectProps, SelectOption } from '../../src/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '../../src/components/Common/UI/Switch/SwitchTypes'
import type {
  ButtonIconProps,
  ButtonProps,
} from '../../src/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '../../src/components/Common/UI/Alert/AlertTypes'
import type { LocalCheckboxGroupProps, LocalRadioGroupProps, OptionWithDescription } from './types'

// Helper function to adapt focus event handlers for different element types
function adaptFocusHandler<T extends HTMLElement>(
  handler?: FocusEventHandler<HTMLInputElement>,
): FocusEventHandler<T> | undefined {
  if (!handler) return undefined

  return (e: React.FocusEvent<T>) => {
    // Cast to the expected type for the onBlur handler
    handler(e as unknown as React.FocusEvent<HTMLInputElement>)
  }
}

// Helper to create a proper FocusEvent
function createFocusEvent(target: EventTarget): React.FocusEvent<HTMLInputElement> {
  const focusEvent = Object.create(new FocusEvent('blur'))
  Object.defineProperty(focusEvent, 'target', {
    get: () => target,
  })

  return focusEvent as unknown as React.FocusEvent<HTMLInputElement>
}

// Radix Alert adapter component
function RadixAlert({ label, children, status = 'info', icon }: AlertProps) {
  const getStatusClass = () => {
    switch (status) {
      case 'error':
        return 'radix-alert-error'
      case 'warning':
        return 'radix-alert-warning'
      case 'success':
        return 'radix-alert-success'
      default:
        return 'radix-alert-info'
    }
  }

  return (
    <div className={`radix-alert ${getStatusClass()}`}>
      {icon && <span className="radix-alert-icon">{icon}</span>}
      <div>
        {label && <strong className="radix-alert-label">{label}</strong>}
        {children}
      </div>
    </div>
  )
}

// Radix Button adapter component
function RadixButton({
  variant = 'primary',
  isError = false,
  isLoading = false,
  isDisabled = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const getVariantClass = () => {
    if (isError) return 'radix-button-error'
    switch (variant) {
      case 'primary':
        return 'radix-button-primary'
      case 'secondary':
        return 'radix-button-secondary'
      default:
        return 'radix-button-tertiary'
    }
  }

  return (
    <button
      className={`radix-button ${getVariantClass()} ${isLoading ? 'radix-button-loading' : ''}`}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="radix-button-loader">
          <svg className="radix-spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle
              className="radix-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </span>
      ) : null}
      {children}
    </button>
  )
}

// Radix ButtonIcon adapter component
function RadixButtonIcon({
  isError = false,
  isLoading = false,
  isDisabled = false,
  children,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: ButtonIconProps) {
  const buttonClass = isError ? 'radix-button-icon-error' : 'radix-button-icon'

  return (
    <button
      className={`${buttonClass} ${isLoading ? 'radix-button-loading' : ''}`}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? (
        <svg className="radix-spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle
            className="radix-spinner-circle"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  )
}

// Radix TextInput adapter component
function RadixTextInput({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: TextInputProps) {
  const inputId = id || `text-input-${name}`

  return (
    <div className="radix-field-wrapper">
      {!shouldVisuallyHideLabel && (
        <Label.Root className="radix-label" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root className="radix-label visually-hidden" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <input
        type="text"
        id={inputId}
        name={name}
        ref={inputRef}
        value={value || ''}
        placeholder={placeholder}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        className={`radix-input ${isInvalid ? 'radix-input-error' : ''}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange && onChange(e.target.value)
        }}
        onBlur={onBlur}
        required={isRequired}
        {...props}
      />
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix NumberInput adapter component
function RadixNumberInput({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  min,
  max,
  placeholder,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: NumberInputProps) {
  const inputId = id || `number-input-${name}`

  return (
    <div className="radix-field-wrapper">
      {!shouldVisuallyHideLabel && (
        <Label.Root className="radix-label" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root className="radix-label visually-hidden" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <input
        type="number"
        id={inputId}
        name={name}
        ref={inputRef}
        value={value !== undefined ? value : ''}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        className={`radix-input ${isInvalid ? 'radix-input-error' : ''}`}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange && onChange(parseFloat(e.target.value))
        }}
        onBlur={onBlur}
        required={isRequired}
        {...props}
      />
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix Checkbox adapter component
function RadixCheckboxComponent({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${name}`
  const handleBlur = adaptFocusHandler(onBlur)

  return (
    <div className="radix-field-wrapper">
      <div className="radix-checkbox-container">
        <Checkbox.Root
          className={`radix-checkbox ${isInvalid ? 'radix-checkbox-error' : ''}`}
          id={checkboxId}
          name={name}
          checked={value || false}
          onCheckedChange={(checked: boolean) => {
            onChange && onChange(checked)
          }}
          onBlur={handleBlur}
          disabled={isDisabled}
          required={isRequired}
          {...props}
        >
          <Checkbox.Indicator className="radix-checkbox-indicator">
            <CheckIcon />
          </Checkbox.Indicator>
        </Checkbox.Root>
        {!shouldVisuallyHideLabel && (
          <Label.Root className="radix-label" htmlFor={checkboxId}>
            {label}
            {isRequired && <span className="radix-required-indicator">*</span>}
          </Label.Root>
        )}
        {shouldVisuallyHideLabel && (
          <Label.Root className="radix-label visually-hidden" htmlFor={checkboxId}>
            {label}
            {isRequired && <span className="radix-required-indicator">*</span>}
          </Label.Root>
        )}
      </div>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix CheckboxGroup adapter component
function RadixCheckboxGroup({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  shouldVisuallyHideLabel,
  value = [],
  options,
  onChange,
}: LocalCheckboxGroupProps) {
  const groupId = `checkbox-group-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div className="radix-field-wrapper" role="group" aria-labelledby={`${groupId}-label`}>
      {!shouldVisuallyHideLabel && (
        <Label.Root id={`${groupId}-label`} className="radix-label">
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root id={`${groupId}-label`} className="radix-label visually-hidden">
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <div className="radix-checkbox-group">
        {options.map(option => (
          <div key={option.value} className="radix-checkbox-option">
            <div className="radix-checkbox-container">
              <Checkbox.Root
                className={`radix-checkbox ${isInvalid ? 'radix-checkbox-error' : ''}`}
                id={`${groupId}-${option.value}`}
                checked={value.includes(option.value)}
                onCheckedChange={(checked: boolean) => {
                  if (!onChange) return
                  const newValue = checked
                    ? [...value, option.value]
                    : value.filter((v: string) => v !== option.value)
                  onChange(newValue)
                }}
                disabled={isDisabled}
              >
                <Checkbox.Indicator className="radix-checkbox-indicator">
                  <CheckIcon />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <Label.Root className="radix-label" htmlFor={`${groupId}-${option.value}`}>
                {option.label}
              </Label.Root>
            </div>
            {option.description && (
              <div className="radix-option-description">{option.description}</div>
            )}
          </div>
        ))}
      </div>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix ComboBox adapter component
function RadixComboBox({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  placeholder,
  options,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: ComboBoxProps) {
  const inputId = id || `combobox-${name}`

  return (
    <div className="radix-field-wrapper">
      {!shouldVisuallyHideLabel && (
        <Label.Root className="radix-label" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root className="radix-label visually-hidden" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <button
            className={`radix-combobox-trigger ${isInvalid ? 'radix-combobox-error' : ''}`}
            disabled={isDisabled}
            type="button"
          >
            {value || placeholder || 'Select...'}
            <ChevronDownIcon className="radix-combobox-icon" />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content className="radix-combobox-content">
          <input
            id={inputId}
            name={name}
            ref={inputRef}
            value={value || ''}
            placeholder={placeholder}
            disabled={isDisabled}
            className={`radix-combobox-input ${isInvalid ? 'radix-input-error' : ''}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange && onChange(e.target.value)
            }}
            onBlur={onBlur}
            required={isRequired}
            {...props}
          />
          <div className="radix-combobox-options" role="listbox">
            {options.map(option => (
              <button
                key={option.value}
                className="radix-combobox-option"
                onClick={() => {
                  onChange && onChange(option.value)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onChange && onChange(option.value)
                  }
                }}
                role="option"
                aria-selected={value === option.value}
                tabIndex={0}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix DatePicker adapter component - Using MUI DatePicker for now as Radix doesn't have a direct DatePicker
function RadixDatePicker({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: DatePickerProps) {
  const inputId = id || `date-picker-${name}`

  return (
    <div className="radix-field-wrapper">
      {!shouldVisuallyHideLabel && (
        <Label.Root className="radix-label" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root className="radix-label visually-hidden" htmlFor={inputId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          value={value || null}
          onChange={newValue => {
            onChange && onChange(newValue)
          }}
          disabled={isDisabled}
          slotProps={{
            textField: {
              id: inputId,
              name,
              inputRef,
              error: isInvalid,
              helperText: isInvalid ? errorMessage : description,
              required: isRequired,
              placeholder,
              onBlur,
              className: 'radix-date-picker',
              fullWidth: true,
            },
          }}
          {...props}
        />
      </LocalizationProvider>
    </div>
  )
}

// Radix Radio adapter component
function RadixRadio({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: RadioProps) {
  const radioId = id || `radio-${name}`
  const handleBlur = adaptFocusHandler<HTMLDivElement>(onBlur)

  return (
    <div className="radix-field-wrapper">
      <div className="radix-radio-container">
        <RadioGroup.Root
          className="radix-radio-group-single"
          defaultValue={value ? 'checked' : 'unchecked'}
          onValueChange={(newValue: string) => {
            onChange && onChange(newValue === 'checked')
          }}
          disabled={isDisabled}
          required={isRequired}
          onBlur={handleBlur}
        >
          <div className="radix-radio-wrapper">
            <RadioGroup.Item
              className={`radix-radio-item ${isInvalid ? 'radix-radio-error' : ''}`}
              id={radioId}
              value="checked"
              {...props}
            >
              <RadioGroup.Indicator className="radix-radio-indicator" />
            </RadioGroup.Item>
            {!shouldVisuallyHideLabel && (
              <Label.Root className="radix-label" htmlFor={radioId}>
                {label}
                {isRequired && <span className="radix-required-indicator">*</span>}
              </Label.Root>
            )}
            {shouldVisuallyHideLabel && (
              <Label.Root className="radix-label visually-hidden" htmlFor={radioId}>
                {label}
                {isRequired && <span className="radix-required-indicator">*</span>}
              </Label.Root>
            )}
          </div>
        </RadioGroup.Root>
      </div>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix RadioGroup adapter component
function RadixRadioGroupComponent({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  shouldVisuallyHideLabel,
  value = '',
  options,
  onChange,
}: LocalRadioGroupProps) {
  const groupId = `radio-group-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div className="radix-field-wrapper">
      {!shouldVisuallyHideLabel && (
        <Label.Root id={`${groupId}-label`} className="radix-label">
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root id={`${groupId}-label`} className="radix-label visually-hidden">
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <RadioGroup.Root
        className="radix-radio-group"
        value={value}
        onValueChange={newValue => {
          onChange && onChange(newValue)
        }}
        disabled={isDisabled}
        required={isRequired}
        aria-labelledby={`${groupId}-label`}
      >
        {options.map(option => (
          <div key={option.value} className="radix-radio-option">
            <div className="radix-radio-wrapper">
              <RadioGroup.Item
                className={`radix-radio-item ${isInvalid ? 'radix-radio-error' : ''}`}
                id={`${groupId}-${option.value}`}
                value={option.value}
                disabled={isDisabled}
              >
                <RadioGroup.Indicator className="radix-radio-indicator" />
              </RadioGroup.Item>
              <Label.Root className="radix-label" htmlFor={`${groupId}-${option.value}`}>
                {option.label}
              </Label.Root>
            </div>
            {option.description && (
              <div className="radix-option-description">{option.description}</div>
            )}
          </div>
        ))}
      </RadioGroup.Root>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix Select adapter component
function RadixSelectComponent({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  options,
  placeholder,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: SelectProps) {
  const selectId = id || `select-${name}`
  const selectRef = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="radix-field-wrapper">
      {!shouldVisuallyHideLabel && (
        <Label.Root className="radix-label" htmlFor={selectId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      {shouldVisuallyHideLabel && (
        <Label.Root className="radix-label visually-hidden" htmlFor={selectId}>
          {label}
          {isRequired && <span className="radix-required-indicator">*</span>}
        </Label.Root>
      )}
      <Select.Root
        name={name}
        value={value || ''}
        onValueChange={newValue => {
          onChange && onChange(newValue)
        }}
        disabled={isDisabled}
        required={isRequired}
        onOpenChange={() => {
          if (onBlur && selectRef.current) {
            onBlur(createFocusEvent(selectRef.current))
          }
        }}
      >
        <Select.Trigger
          className={`radix-select-trigger ${isInvalid ? 'radix-select-error' : ''}`}
          id={selectId}
          aria-label={label}
          ref={selectRef}
        >
          <Select.Value placeholder={placeholder || 'Select an option'} />
          <Select.Icon className="radix-select-icon">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="radix-select-content">
            <Select.ScrollUpButton className="radix-select-scroll-button">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport className="radix-select-viewport">
              {placeholder && (
                <Select.Item className="radix-select-item" value="" disabled>
                  <Select.ItemText>{placeholder}</Select.ItemText>
                </Select.Item>
              )}
              {options.map(option => (
                <Select.Item
                  key={option.value}
                  className="radix-select-item"
                  value={option.value}
                  disabled={false}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="radix-select-item-indicator">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="radix-select-scroll-button">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Radix Switch adapter component
function RadixSwitchComponent({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props
}: SwitchProps) {
  const switchId = id || `switch-${name}`
  const switchRef = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="radix-field-wrapper">
      <div className="radix-switch-container">
        <Switch.Root
          className={`radix-switch ${isInvalid ? 'radix-switch-error' : ''}`}
          id={switchId}
          name={name}
          checked={value || false}
          onCheckedChange={(checked: boolean) => {
            onChange && onChange(checked)
          }}
          disabled={isDisabled}
          required={isRequired}
          ref={switchRef}
          onBlur={() => {
            if (onBlur && switchRef.current) {
              onBlur(createFocusEvent(switchRef.current))
            }
          }}
          {...props}
        >
          <Switch.Thumb className="radix-switch-thumb" />
        </Switch.Root>
        {!shouldVisuallyHideLabel && (
          <Label.Root className="radix-label" htmlFor={switchId}>
            {label}
            {isRequired && <span className="radix-required-indicator">*</span>}
          </Label.Root>
        )}
        {shouldVisuallyHideLabel && (
          <Label.Root className="radix-label visually-hidden" htmlFor={switchId}>
            {label}
            {isRequired && <span className="radix-required-indicator">*</span>}
          </Label.Root>
        )}
      </div>
      {description && !isInvalid && <div className="radix-description">{description}</div>}
      {isInvalid && errorMessage && <div className="radix-error-message">{errorMessage}</div>}
    </div>
  )
}

// Export the adapter object
export const RadixComponentAdapter = {
  Alert: RadixAlert,
  Button: RadixButton,
  ButtonIcon: RadixButtonIcon,
  TextInput: RadixTextInput,
  NumberInput: RadixNumberInput,
  Checkbox: RadixCheckboxComponent,
  CheckboxGroup: RadixCheckboxGroup,
  ComboBox: RadixComboBox,
  DatePicker: RadixDatePicker,
  Radio: RadixRadio,
  RadioGroup: RadixRadioGroupComponent,
  Select: RadixSelectComponent,
  Switch: RadixSwitchComponent,
}
