import type React from 'react'
import {
  TextField,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup as MuiRadioGroup,
  Select as MuiSelect,
  MenuItem,
  InputLabel,
  Switch as MuiSwitch,
  Autocomplete,
  Alert as MuiAlert,
  Button as MuiButton,
  IconButton,
  CircularProgress,
  type AutocompleteRenderInputParams,
  type SelectChangeEvent,
  Checkbox as MuiCheckbox,
  Radio as MuiRadio,
} from '@mui/material'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import type { FocusEventHandler } from 'react'
import type { TextInputProps } from '../../src/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '../../src/components/Common/UI/NumberInput/NumberInputTypes'
import type { ComboBoxProps } from '../../src/components/Common/UI/ComboBox/ComboBoxTypes'
import type { CheckboxProps } from '../../src/components/Common/UI/Checkbox/CheckboxTypes'
import type { DatePickerProps } from '../../src/components/Common/UI/DatePicker/DatePickerTypes'
import type { RadioProps } from '../../src/components/Common/UI/Radio/RadioTypes'
import type { SelectProps } from '../../src/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '../../src/components/Common/UI/Switch/SwitchTypes'
import type {
  ButtonIconProps,
  ButtonProps,
} from '../../src/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '../../src/components/Common/UI/Alert/AlertTypes'
import type { LocalCheckboxGroupProps, LocalRadioGroupProps } from './types'

// Custom type for MUI checkbox onBlur to fix type compatibility
type MUIBlurHandler = FocusEventHandler<HTMLButtonElement>
type InputBlurHandler = FocusEventHandler<HTMLInputElement>

// Helper function to adapt focus event handlers
function adaptFocusHandler(handler?: InputBlurHandler): MUIBlurHandler | undefined {
  if (!handler) return undefined

  return (e: React.FocusEvent<HTMLButtonElement>) => {
    // Cast to the expected type for the onBlur handler
    handler(e as unknown as React.FocusEvent<HTMLInputElement>)
  }
}

// MUI Alert adapter component
function MUIAlert({ label, children, status = 'info', icon }: AlertProps) {
  const severity =
    status === 'error'
      ? 'error'
      : status === 'warning'
        ? 'warning'
        : status === 'success'
          ? 'success'
          : 'info'

  return (
    <MuiAlert severity={severity} icon={icon || undefined} sx={{ mb: 2 }}>
      <div>
        <strong>{label}</strong>
        {children}
      </div>
    </MuiAlert>
  )
}

// MUI Button adapter component
function MUIButton({
  variant = 'primary',
  isError = false,
  isLoading = false,
  isDisabled = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const muiVariant =
    variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'
  const color = isError ? 'error' : 'primary'

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
      {...props}
    >
      {children}
    </MuiButton>
  )
}

// MUI ButtonIcon adapter component
function MUIButtonIcon({
  isError = false,
  isLoading = false,
  isDisabled = false,
  children,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: ButtonIconProps) {
  const color = isError ? 'error' : 'primary'

  return (
    <IconButton
      color={color}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? <CircularProgress size={20} /> : children}
    </IconButton>
  )
}

// MUI TextInput adapter component
function MUITextInput({
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
    <TextField
      id={inputId}
      name={name}
      inputRef={inputRef}
      value={value || ''}
      placeholder={placeholder}
      disabled={isDisabled}
      error={isInvalid}
      helperText={isInvalid ? errorMessage : description}
      label={shouldVisuallyHideLabel ? undefined : label}
      aria-label={
        shouldVisuallyHideLabel ? (typeof label === 'string' ? label : undefined) : undefined
      }
      required={isRequired}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(e.target.value)
      }}
      onBlur={onBlur}
      fullWidth
      variant="outlined"
      {...props}
    />
  )
}

// MUI NumberInput adapter component
function MUINumberInput({
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
    <TextField
      id={inputId}
      name={name}
      inputRef={inputRef}
      value={value !== undefined ? value : ''}
      placeholder={placeholder}
      disabled={isDisabled}
      error={isInvalid}
      helperText={isInvalid ? errorMessage : description}
      label={shouldVisuallyHideLabel ? undefined : label}
      aria-label={
        shouldVisuallyHideLabel ? (typeof label === 'string' ? label : undefined) : undefined
      }
      required={isRequired}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(parseFloat(e.target.value))
      }}
      onBlur={onBlur}
      fullWidth
      variant="outlined"
      type="number"
      inputProps={{
        min,
        max,
      }}
      {...props}
    />
  )
}

// MUI Checkbox adapter component
function MUICheckbox({
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
    <FormControl error={isInvalid} required={isRequired}>
      <FormControlLabel
        control={
          <MuiCheckbox
            id={checkboxId}
            name={name}
            checked={value || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange && onChange(e.target.checked)
            }}
            onBlur={handleBlur}
            inputRef={inputRef}
            disabled={isDisabled}
            {...props}
          />
        }
        label={shouldVisuallyHideLabel ? undefined : label}
      />
      {description && !isInvalid && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

// MUI CheckboxGroup adapter component
function MUICheckboxGroup({
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
  // Generate a unique ID for the group
  const groupId = `checkbox-group-${Math.random().toString(36).substring(2, 9)}`

  return (
    <FormControl error={isInvalid} required={isRequired}>
      {!shouldVisuallyHideLabel && <FormLabel id={`${groupId}-label`}>{label}</FormLabel>}
      {shouldVisuallyHideLabel && (
        <FormLabel id={`${groupId}-label`} className="visually-hidden">
          {label}
        </FormLabel>
      )}
      <FormGroup>
        {options.map(option => (
          <FormControlLabel
            key={option.value}
            control={
              <MuiCheckbox
                id={`${groupId}-${option.value}`}
                checked={value.includes(option.value)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = e.target.checked
                    ? [...value, option.value]
                    : value.filter((v: string) => v !== option.value)
                  onChange && onChange(newValue)
                }}
                disabled={isDisabled}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      {description && !isInvalid && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

// MUI ComboBox adapter component
function MUIComboBox({
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
    <Autocomplete
      id={inputId}
      options={options.map(option => option.value)}
      value={value || null}
      onChange={(_: unknown, newValue: string | null) => {
        onChange && onChange(newValue || '')
      }}
      freeSolo
      disabled={isDisabled}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          name={name}
          label={shouldVisuallyHideLabel ? undefined : label}
          aria-label={
            shouldVisuallyHideLabel ? (typeof label === 'string' ? label : undefined) : undefined
          }
          placeholder={placeholder}
          error={isInvalid}
          helperText={isInvalid ? errorMessage : description}
          required={isRequired}
          inputRef={inputRef}
          onBlur={onBlur}
          fullWidth
        />
      )}
      {...props}
    />
  )
}

// MUI DatePicker adapter component
function MUIDatePicker({
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        label={shouldVisuallyHideLabel ? undefined : label}
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
            'aria-label': shouldVisuallyHideLabel
              ? typeof label === 'string'
                ? label
                : undefined
              : undefined,
            fullWidth: true,
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  )
}

// MUI Radio adapter component
function MUIRadio({
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
  const handleBlur = adaptFocusHandler(onBlur)

  return (
    <FormControl error={isInvalid} required={isRequired}>
      <FormControlLabel
        control={
          <MuiRadio
            id={radioId}
            name={name}
            checked={value || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange && onChange(e.target.checked)
            }}
            onBlur={handleBlur}
            inputRef={inputRef}
            disabled={isDisabled}
            {...props}
          />
        }
        label={shouldVisuallyHideLabel ? undefined : label}
      />
      {description && !isInvalid && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

// MUI RadioGroup adapter component
function MUIRadioGroup({
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
  // Generate a unique ID for the group
  const groupId = `radio-group-${Math.random().toString(36).substring(2, 9)}`

  return (
    <FormControl error={isInvalid} required={isRequired}>
      {!shouldVisuallyHideLabel && <FormLabel id={`${groupId}-label`}>{label}</FormLabel>}
      {shouldVisuallyHideLabel && (
        <FormLabel id={`${groupId}-label`} className="visually-hidden">
          {label}
        </FormLabel>
      )}
      <MuiRadioGroup
        aria-labelledby={`${groupId}-label`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange && onChange(e.target.value)
        }}
      >
        {options.map(option => (
          <div key={option.value} style={{ marginBottom: option.description ? '8px' : '0' }}>
            <FormControlLabel
              value={option.value}
              control={<MuiRadio disabled={isDisabled} />}
              label={option.label}
            />
            {option.description && (
              <div style={{ marginLeft: '32px', color: '#666', fontSize: '0.875rem' }}>
                {option.description}
              </div>
            )}
          </div>
        ))}
      </MuiRadioGroup>
      {description && !isInvalid && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

// MUI Select adapter component
function MUISelect({
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

  return (
    <FormControl fullWidth error={isInvalid} required={isRequired} disabled={isDisabled}>
      {!shouldVisuallyHideLabel && <InputLabel id={`${selectId}-label`}>{label}</InputLabel>}
      {shouldVisuallyHideLabel && (
        <InputLabel id={`${selectId}-label`} className="visually-hidden">
          {label}
        </InputLabel>
      )}
      <MuiSelect
        labelId={`${selectId}-label`}
        id={selectId}
        name={name}
        value={value || ''}
        label={shouldVisuallyHideLabel ? undefined : label}
        onChange={(e: SelectChangeEvent) => {
          onChange && onChange(e.target.value)
        }}
        onBlur={onBlur}
        inputRef={inputRef}
        displayEmpty={!!placeholder}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {description && !isInvalid && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

// MUI Switch adapter component
function MUISwitch({
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

  return (
    <FormControl error={isInvalid} required={isRequired}>
      <FormControlLabel
        control={
          <MuiSwitch
            id={switchId}
            name={name}
            checked={value || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange && onChange(e.target.checked)
            }}
            onBlur={onBlur}
            inputRef={inputRef}
            disabled={isDisabled}
            {...props}
          />
        }
        label={shouldVisuallyHideLabel ? undefined : label}
      />
      {description && !isInvalid && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

// Export the adapter object
export const MUIComponentAdapter = {
  Alert: MUIAlert,
  Button: MUIButton,
  ButtonIcon: MUIButtonIcon,
  TextInput: MUITextInput,
  NumberInput: MUINumberInput,
  Checkbox: MUICheckbox,
  CheckboxGroup: MUICheckboxGroup,
  ComboBox: MUIComboBox,
  DatePicker: MUIDatePicker,
  Radio: MUIRadio,
  RadioGroup: MUIRadioGroup,
  Select: MUISelect,
  Switch: MUISwitch,
}
