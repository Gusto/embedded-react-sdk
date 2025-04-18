import React from 'react'
import type { TextInputProps } from '../../src/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '../../src/components/Common/UI/NumberInput/NumberInputTypes'
import type { CheckboxGroupProps } from '../../src/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { ComboBoxProps } from '../../src/components/Common/UI/ComboBox/ComboBoxTypes'
import type { CheckboxProps } from '../../src/components/Common/UI/Checkbox/CheckboxTypes'
import type { DatePickerProps } from '../../src/components/Common/UI/DatePicker/DatePickerTypes'
import type { RadioProps } from '../../src/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '../../src/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SelectProps } from '../../src/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '../../src/components/Common/UI/Switch/SwitchTypes'

// MUI Component imports
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  Radio,
  RadioGroup as MuiRadioGroup,
  Select as MuiSelect,
  MenuItem,
  InputLabel,
  Switch as MuiSwitch,
  Autocomplete,
} from '@mui/material'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

export const MUIComponentAdapter = {
  TextInput: ({
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
  }: TextInputProps) => {
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
        helperText={errorMessage || description}
        label={shouldVisuallyHideLabel ? undefined : label}
        aria-label={
          shouldVisuallyHideLabel ? (typeof label === 'string' ? label : undefined) : undefined
        }
        required={isRequired}
        onChange={e => {
          onChange && onChange(e.target.value)
        }}
        onBlur={onBlur}
        fullWidth
        variant="outlined"
        {...props}
      />
    )
  },

  NumberInput: ({
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
  }: NumberInputProps) => {
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
        helperText={errorMessage || description}
        label={shouldVisuallyHideLabel ? undefined : label}
        aria-label={
          shouldVisuallyHideLabel ? (typeof label === 'string' ? label : undefined) : undefined
        }
        required={isRequired}
        onChange={e => {
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
  },

  Checkbox: ({
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
  }: CheckboxProps) => {
    const inputId = id || `checkbox-${name}`

    // Directly create an event handler that calls the original onBlur with the expected event type
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange && onChange(e.target.checked)
    }

    return (
      <FormControl error={isInvalid} required={isRequired}>
        <FormControlLabel
          control={
            <Checkbox
              id={inputId}
              name={name}
              inputRef={inputRef}
              checked={value}
              onChange={handleChange}
              disabled={isDisabled}
              required={isRequired}
              {...props}
            />
          }
          label={shouldVisuallyHideLabel ? '' : label}
        />
        {description && <FormHelperText>{description}</FormHelperText>}
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },

  CheckboxGroup: ({
    label,
    description,
    errorMessage,
    isRequired,
    isDisabled,
    isInvalid,
    options,
    value = [],
    onChange,
    inputRef,
    shouldVisuallyHideLabel,
    ...props
  }: CheckboxGroupProps) => {
    const labelText = typeof label === 'string' ? label : 'checkbox-group'
    const fieldsetId = `checkbox-group-${labelText.toLowerCase().replace(/\s+/g, '-')}`

    const handleChange = (optionValue: string, isChecked: boolean) => {
      if (!onChange) return

      if (isChecked) {
        onChange([...value, optionValue])
      } else {
        onChange(value.filter(v => v !== optionValue))
      }
    }

    return (
      <FormControl
        component="fieldset"
        error={isInvalid}
        required={isRequired}
        disabled={isDisabled}
        {...props}
      >
        {!shouldVisuallyHideLabel && <FormLabel component="legend">{label}</FormLabel>}
        {shouldVisuallyHideLabel && (
          <FormLabel component="legend" className="visually-hidden">
            {label}
          </FormLabel>
        )}
        {description && <FormHelperText>{description}</FormHelperText>}
        <FormGroup>
          {options.map((option, index) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={value.includes(option.value)}
                  onChange={e => handleChange(option.value, e.target.checked)}
                  value={option.value}
                  disabled={isDisabled || option.isDisabled}
                  inputRef={index === 0 ? inputRef : undefined}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>
        {options.map(
          option =>
            option.description && (
              <FormHelperText key={`desc-${option.value}`}>{option.description}</FormHelperText>
            ),
        )}
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },

  ComboBox: ({
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
  }: ComboBoxProps) => {
    const inputId = id || `combobox-${name}`

    return (
      <Autocomplete
        id={inputId}
        options={options.map(option => option.value)}
        value={value || null}
        onChange={(_, newValue) => {
          onChange && onChange(newValue || '')
        }}
        freeSolo
        disabled={isDisabled}
        renderInput={params => (
          <TextField
            {...params}
            name={name}
            label={shouldVisuallyHideLabel ? undefined : label}
            aria-label={
              shouldVisuallyHideLabel ? (typeof label === 'string' ? label : undefined) : undefined
            }
            placeholder={placeholder}
            error={isInvalid}
            helperText={errorMessage || description}
            required={isRequired}
            inputRef={inputRef}
            onBlur={onBlur}
            fullWidth
          />
        )}
        {...props}
      />
    )
  },

  DatePicker: ({
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
  }: DatePickerProps) => {
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
              helperText: errorMessage || description,
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
  },

  Radio: ({
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
  }: RadioProps) => {
    const inputId = id || `radio-${name}-${value}`

    // Directly create an event handler that calls the original onChange with the expected type
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange && onChange(e.target.checked)
    }

    return (
      <FormControl error={isInvalid} required={isRequired}>
        <FormControlLabel
          control={
            <Radio
              id={inputId}
              name={name}
              inputRef={inputRef}
              checked={value}
              onChange={handleChange}
              disabled={isDisabled}
              required={isRequired}
              {...props}
            />
          }
          label={shouldVisuallyHideLabel ? '' : label}
        />
        {description && <FormHelperText>{description}</FormHelperText>}
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },

  RadioGroup: ({
    label,
    description,
    errorMessage,
    isRequired,
    isDisabled,
    isInvalid,
    options,
    value,
    onChange,
    inputRef,
    shouldVisuallyHideLabel,
    ...props
  }: RadioGroupProps) => {
    const labelText = typeof label === 'string' ? label : 'radio-group'
    const fieldsetId = `radio-group-${labelText.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <FormControl error={isInvalid} required={isRequired} disabled={isDisabled} {...props}>
        {!shouldVisuallyHideLabel && <FormLabel>{label}</FormLabel>}
        {shouldVisuallyHideLabel && <FormLabel className="visually-hidden">{label}</FormLabel>}
        {description && <FormHelperText>{description}</FormHelperText>}
        <MuiRadioGroup
          name={fieldsetId}
          value={value || ''}
          onChange={e => {
            onChange && onChange(e.target.value)
          }}
        >
          {options.map((option, index) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  inputRef={index === 0 ? inputRef : undefined}
                  disabled={isDisabled || option.isDisabled}
                />
              }
              label={option.label}
              disabled={isDisabled || option.isDisabled}
            />
          ))}
        </MuiRadioGroup>
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },

  Select: ({
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
  }: SelectProps) => {
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
          onChange={e => {
            onChange && onChange(e.target.value as string)
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
        {(description || errorMessage) && (
          <FormHelperText error={!!errorMessage}>{errorMessage || description}</FormHelperText>
        )}
      </FormControl>
    )
  },

  Switch: ({
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
  }: SwitchProps) => {
    const inputId = id || `switch-${name}`

    // Directly create an event handler that calls the original onChange with the expected type
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange && onChange(e.target.checked)
    }

    return (
      <FormControl error={isInvalid} required={isRequired}>
        <FormControlLabel
          control={
            <MuiSwitch
              id={inputId}
              name={name}
              inputRef={inputRef}
              checked={value}
              onChange={handleChange}
              disabled={isDisabled}
              required={isRequired}
              {...props}
            />
          }
          label={shouldVisuallyHideLabel ? '' : label}
        />
        {description && <FormHelperText>{description}</FormHelperText>}
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },
}
