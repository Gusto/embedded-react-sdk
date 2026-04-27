/**
 * Shopify Polaris adapter for the Gusto Embedded SDK.
 * Maps SDK component interfaces to Polaris equivalents.
 */
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import {
  Button as PolarisButton,
  TextField as PolarisTextField,
  Select as PolarisSelect,
  Banner as PolarisBanner,
  Checkbox as PolarisCheckbox,
  RadioButton,
  BlockStack,
  Text as PolarisText,
  Card as PolarisCard,
  Spinner,
  Tabs as PolarisTabs,
  Box as PolarisBox,
} from '@shopify/polaris'
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
function PolarisButtonAdapter({
  variant,
  isLoading,
  isDisabled,
  children,
  onClick,
  type,
}: ButtonProps) {
  const tone = variant === 'error' ? 'critical' : undefined
  const variantMap =
    variant === 'primary' ? 'primary' : variant === 'secondary' ? undefined : 'plain'

  return (
    <PolarisButton
      variant={variantMap}
      tone={tone}
      loading={isLoading}
      disabled={isDisabled}
      onClick={onClick as () => void}
      submit={type === 'submit'}
    >
      {typeof children === 'string' ? children : ''}
    </PolarisButton>
  )
}

// TextInput
function PolarisTextInputAdapter({
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
}: TextInputProps) {
  return (
    <PolarisTextField
      label={typeof label === 'string' ? label : ''}
      value={value ?? ''}
      onChange={v => onChange?.(v)}
      onBlur={onBlur}
      error={isInvalid ? errorMessage || true : undefined}
      disabled={isDisabled}
      helpText={!isInvalid ? description : undefined}
      placeholder={placeholder}
      requiredIndicator={isRequired}
      type={type as 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url' | undefined}
      name={name}
      id={id}
      autoComplete="off"
    />
  )
}

// Select
function PolarisSelectAdapter({
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
  const polarisOptions = [
    ...(placeholder ? [{ label: placeholder, value: '', disabled: true }] : []),
    ...options.map(o => ({ label: o.label, value: o.value })),
  ]

  const descriptionText = typeof description === 'string' ? description : undefined

  return (
    <PolarisSelect
      label={typeof label === 'string' ? label : ''}
      options={polarisOptions}
      value={value ?? ''}
      onChange={v => onChange?.(v)}
      onBlur={onBlur}
      error={isInvalid ? errorMessage || true : undefined}
      disabled={isDisabled}
      helpText={!isInvalid ? descriptionText : undefined}
      requiredIndicator={isRequired}
      name={name}
      id={id}
    />
  )
}

// Alert → Polaris Banner
function PolarisAlertAdapter({ status = 'info', label, children, onDismiss }: AlertProps) {
  const tone =
    status === 'success'
      ? 'success'
      : status === 'warning'
        ? 'warning'
        : status === 'error'
          ? 'critical'
          : undefined

  return (
    <PolarisBanner tone={tone} onDismiss={onDismiss} title={label}>
      {children ? <p>{children}</p> : null}
    </PolarisBanner>
  )
}

// Banner → Polaris Banner
function PolarisBannerAdapter({ status, title, children }: BannerProps) {
  const tone = status === 'error' ? 'critical' : 'warning'
  return (
    <PolarisBanner tone={tone} title={typeof title === 'string' ? title : ''}>
      {children ? <p>{typeof children === 'string' ? children : ''}</p> : null}
    </PolarisBanner>
  )
}

// Checkbox
function PolarisCheckboxAdapter({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  name,
  id,
  errorMessage,
}: CheckboxProps) {
  return (
    <PolarisCheckbox
      label={typeof label === 'string' ? label : ''}
      checked={value ?? false}
      onChange={v => onChange?.(v)}
      disabled={isDisabled}
      error={isInvalid ? errorMessage || true : undefined}
      name={name}
      id={id}
    />
  )
}

// Switch - Polaris doesn't have a native switch, use Checkbox
function PolarisSwitchAdapter({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  name,
  id,
  errorMessage,
}: SwitchProps) {
  return (
    <PolarisCheckbox
      label={label}
      checked={value ?? false}
      onChange={v => onChange?.(v)}
      disabled={isDisabled}
      error={isInvalid ? errorMessage || true : undefined}
      name={name}
      id={id}
    />
  )
}

// RadioGroup
function PolarisRadioGroupAdapter({
  label,
  options,
  value,
  onChange,
  isDisabled,
  errorMessage,
  isInvalid,
}: RadioGroupProps) {
  const labelText = typeof label === 'string' ? label : ''
  return (
    <BlockStack gap="200">
      <PolarisText as="p" variant="bodyMd" fontWeight="medium">
        {label}
      </PolarisText>
      {options.map(opt => (
        <RadioButton
          key={opt.value}
          label={typeof opt.label === 'string' ? opt.label : ''}
          checked={value === opt.value}
          onChange={() => onChange?.(opt.value)}
          disabled={isDisabled || opt.isDisabled}
          id={opt.value}
          name={labelText}
          helpText={typeof opt.description === 'string' ? opt.description : undefined}
        />
      ))}
      {isInvalid && errorMessage && (
        <PolarisText as="p" tone="critical" variant="bodySm">
          {errorMessage}
        </PolarisText>
      )}
    </BlockStack>
  )
}

// Heading
function PolarisHeadingAdapter({ as, children }: HeadingProps) {
  const variantMap: Record<
    string,
    'heading2xl' | 'headingXl' | 'headingLg' | 'headingMd' | 'headingSm' | 'headingXs'
  > = {
    h1: 'heading2xl',
    h2: 'headingXl',
    h3: 'headingLg',
    h4: 'headingMd',
    h5: 'headingSm',
    h6: 'headingXs',
  }
  const variant = variantMap[as] ?? 'headingMd'
  return (
    <PolarisText as={as} variant={variant}>
      {children}
    </PolarisText>
  )
}

// Text
function PolarisTextAdapter({ children, size }: TextProps) {
  const variant = size === 'xs' || size === 'sm' ? 'bodySm' : size === 'lg' ? 'bodyLg' : 'bodyMd'
  return (
    <PolarisText as="p" variant={variant}>
      {children}
    </PolarisText>
  )
}

// Card
function PolarisCardAdapter({ children }: CardProps) {
  return <PolarisCard padding="400">{children}</PolarisCard>
}

// LoadingSpinner
function PolarisLoadingSpinnerAdapter({ className }: LoadingSpinnerProps) {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}
      className={className}
    >
      <Spinner accessibilityLabel="Loading" size="large" />
    </div>
  )
}

// Tabs
function PolarisTabsAdapter({ tabs, selectedId, onSelectionChange, className }: TabsProps) {
  const [localTab, setLocalTab] = useState(selectedId ?? tabs[0]?.id ?? '')
  const activeTab = selectedId !== undefined ? selectedId : localTab
  const activeIndex = tabs.findIndex(t => t.id === activeTab)

  const polarisTabs = tabs.map(t => ({
    id: t.id,
    content: typeof t.label === 'string' ? t.label : '',
    panelID: `panel-${t.id}`,
  }))

  return (
    <div className={className}>
      <PolarisTabs
        tabs={polarisTabs}
        selected={activeIndex >= 0 ? activeIndex : 0}
        onSelect={i => {
          const id = tabs[i]?.id
          if (id !== undefined) {
            setLocalTab(id)
            onSelectionChange(id)
          }
        }}
      >
        <PolarisBox padding="400">{tabs.find(t => t.id === activeTab)?.content}</PolarisBox>
      </PolarisTabs>
    </div>
  )
}

export const polarisAdapter: Partial<ComponentsContextType> = {
  Button: PolarisButtonAdapter,
  TextInput: PolarisTextInputAdapter,
  Select: PolarisSelectAdapter,
  Alert: PolarisAlertAdapter,
  Banner: PolarisBannerAdapter,
  Checkbox: PolarisCheckboxAdapter,
  Switch: PolarisSwitchAdapter,
  RadioGroup: PolarisRadioGroupAdapter,
  Heading: PolarisHeadingAdapter,
  Text: PolarisTextAdapter,
  Card: PolarisCardAdapter,
  LoadingSpinner: PolarisLoadingSpinnerAdapter,
  Tabs: PolarisTabsAdapter,
}
