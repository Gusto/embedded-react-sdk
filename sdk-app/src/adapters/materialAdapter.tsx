/**
 * Material UI (Google) adapter for the Gusto Embedded SDK.
 * Maps SDK component interfaces to MUI equivalents.
 */
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import {
  Button as MuiButton,
  TextField as MuiTextField,
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  FormControl as MuiFormControl,
  InputLabel as MuiInputLabel,
  FormHelperText as MuiFormHelperText,
  Alert as MuiAlert,
  Checkbox as MuiCheckbox,
  Switch as MuiSwitch,
  Radio as MuiRadio,
  RadioGroup as MuiRadioGroup,
  FormControlLabel as MuiFormControlLabel,
  FormLabel as MuiFormLabel,
  Typography,
  Card as MuiCard,
  CardContent,
  CircularProgress,
  Tabs as MuiTabs,
  Tab as MuiTab,
} from '@mui/material'
import Box from '@mui/material/Box'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { BannerProps } from '@/components/Common/UI/Banner/BannerTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import type { CardProps } from '@/components/Common/UI/Card/CardTypes'
import type { LoadingSpinnerProps } from '@/components/Common/UI/LoadingSpinner/LoadingSpinnerTypes'
import type { TabsProps } from '@/components/Common/UI/Tabs/TabsTypes'

// Button
function MuiButtonAdapter({
  variant,
  isLoading,
  isDisabled,
  children,
  onClick,
  type,
  icon,
}: ButtonProps) {
  const muiVariant =
    variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'

  const color = variant === 'error' ? 'error' : 'primary'

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      disabled={isDisabled || isLoading}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      type={type}
      startIcon={icon}
      endIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
      disableElevation
    >
      {children}
    </MuiButton>
  )
}

// TextInput
function MuiTextInputAdapter({
  label,
  value,
  onChange,
  onBlur,
  isInvalid,
  isDisabled,
  errorMessage,
  description,
  placeholder,
  isRequired,
  type,
  name,
  id,
  inputRef,
}: TextInputProps) {
  return (
    <MuiTextField
      label={label}
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      onBlur={onBlur}
      error={isInvalid}
      disabled={isDisabled}
      helperText={isInvalid ? errorMessage : description}
      placeholder={placeholder}
      required={isRequired}
      type={type}
      name={name}
      id={id}
      inputRef={inputRef}
      fullWidth
      size="small"
      variant="outlined"
    />
  )
}

// Select
function MuiSelectAdapter({
  label,
  value,
  onChange,
  onBlur,
  isInvalid,
  isDisabled,
  errorMessage,
  description,
  options,
  placeholder,
  isRequired,
  name,
  id,
}: SelectProps) {
  const labelId = `${id ?? name ?? 'select'}-label`
  return (
    <MuiFormControl
      fullWidth
      size="small"
      error={isInvalid}
      required={isRequired}
      disabled={isDisabled}
    >
      <MuiInputLabel id={labelId}>{label}</MuiInputLabel>
      <MuiSelect
        labelId={labelId}
        label={label}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value as string)}
        onBlur={onBlur}
        name={name}
        id={id}
        displayEmpty={!!placeholder}
      >
        {placeholder && (
          <MuiMenuItem value="" disabled>
            <em>{placeholder}</em>
          </MuiMenuItem>
        )}
        {options.map(opt => (
          <MuiMenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MuiMenuItem>
        ))}
      </MuiSelect>
      {(isInvalid ? errorMessage : description) && (
        <MuiFormHelperText>{isInvalid ? errorMessage : description}</MuiFormHelperText>
      )}
    </MuiFormControl>
  )
}

// Alert
function MuiAlertAdapter({ status = 'info', label, children, onDismiss }: AlertProps) {
  const severity =
    status === 'success'
      ? 'success'
      : status === 'warning'
        ? 'warning'
        : status === 'error'
          ? 'error'
          : 'info'
  return (
    <MuiAlert severity={severity} onClose={onDismiss} sx={{ mb: 1 }}>
      <strong>{label}</strong>
      {children && <div>{children}</div>}
    </MuiAlert>
  )
}

// Banner
function MuiBannerAdapter({ status, title, children }: BannerProps) {
  const severity = status === 'error' ? 'error' : 'warning'
  return (
    <MuiAlert severity={severity} sx={{ mb: 1 }}>
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </MuiAlert>
  )
}

// Checkbox
function MuiCheckboxAdapter({
  label,
  value,
  onChange,
  onBlur,
  isDisabled,
  isInvalid,
  name,
  id,
}: CheckboxProps) {
  return (
    <MuiFormControlLabel
      control={
        <MuiCheckbox
          checked={value ?? false}
          onChange={e => onChange?.(e.target.checked)}
          onBlur={onBlur}
          disabled={isDisabled}
          name={name}
          id={id}
          color={isInvalid ? 'error' : 'primary'}
        />
      }
      label={label}
    />
  )
}

// Switch
function MuiSwitchAdapter({
  label,
  value,
  onChange,
  onBlur,
  isDisabled,
  isInvalid,
  name,
  id,
}: SwitchProps) {
  return (
    <MuiFormControlLabel
      control={
        <MuiSwitch
          checked={value ?? false}
          onChange={e => onChange?.(e.target.checked)}
          onBlur={onBlur}
          disabled={isDisabled}
          name={name}
          id={id}
          color={isInvalid ? 'error' : 'primary'}
        />
      }
      label={label}
    />
  )
}

// RadioGroup
function MuiRadioGroupAdapter({
  label,
  options,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
}: RadioGroupProps) {
  return (
    <MuiFormControl error={isInvalid} disabled={isDisabled}>
      <MuiFormLabel>{label}</MuiFormLabel>
      <MuiRadioGroup value={value ?? ''} onChange={e => onChange?.(e.target.value)}>
        {options.map(opt => (
          <MuiFormControlLabel
            key={opt.value}
            value={opt.value}
            control={<MuiRadio />}
            label={opt.label}
            disabled={opt.isDisabled}
          />
        ))}
      </MuiRadioGroup>
      {isInvalid && errorMessage && <MuiFormHelperText>{errorMessage}</MuiFormHelperText>}
    </MuiFormControl>
  )
}

// Heading
function MuiHeadingAdapter({ as, children, className }: HeadingProps) {
  const variantMap: Record<string, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
  }
  const variant = variantMap[as] ?? 'h2'
  return (
    <Typography variant={variant} className={className} gutterBottom>
      {children}
    </Typography>
  )
}

// Text
function MuiTextAdapter({ children, className, size }: TextProps) {
  const typographyVariant =
    size === 'xs' || size === 'sm' ? 'body2' : size === 'lg' ? 'subtitle1' : 'body1'
  return (
    <Typography variant={typographyVariant} className={className}>
      {children}
    </Typography>
  )
}

// Card
function MuiCardAdapter({ children, className }: CardProps) {
  return (
    <MuiCard variant="outlined" className={className} sx={{ mb: 2 }}>
      <CardContent>{children}</CardContent>
    </MuiCard>
  )
}

// LoadingSpinner
function MuiLoadingSpinnerAdapter({ className }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}
      className={className}
    >
      <CircularProgress />
    </Box>
  )
}

// Tabs
function MuiTabsAdapter({ tabs, selectedId, onSelectionChange, className }: TabsProps) {
  const [localTab, setLocalTab] = useState(selectedId ?? tabs[0]?.id ?? '')
  const activeTab = selectedId !== undefined ? selectedId : localTab

  return (
    <div className={className}>
      <MuiTabs
        value={activeTab}
        onChange={(_, v) => {
          setLocalTab(v as string)
          onSelectionChange(v as string)
        }}
      >
        {tabs.map(tab => (
          <MuiTab key={tab.id} value={tab.id} label={tab.label} disabled={tab.isDisabled} />
        ))}
      </MuiTabs>
      <Box sx={{ pt: 2 }}>{tabs.find(t => t.id === activeTab)?.content}</Box>
    </div>
  )
}

export const materialAdapter: Partial<ComponentsContextType> = {
  Button: MuiButtonAdapter,
  TextInput: MuiTextInputAdapter,
  Select: MuiSelectAdapter,
  Alert: MuiAlertAdapter,
  Banner: MuiBannerAdapter,
  Checkbox: MuiCheckboxAdapter,
  Switch: MuiSwitchAdapter,
  RadioGroup: MuiRadioGroupAdapter,
  Heading: MuiHeadingAdapter,
  Text: MuiTextAdapter,
  Card: MuiCardAdapter,
  LoadingSpinner: MuiLoadingSpinnerAdapter,
  Tabs: MuiTabsAdapter,
}
