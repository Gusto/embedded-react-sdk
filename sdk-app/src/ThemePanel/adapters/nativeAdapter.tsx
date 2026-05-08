/* eslint-disable react-refresh/only-export-components */
import { useState, useRef } from 'react'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import type { BannerProps } from '@/components/Common/UI/Banner/BannerTypes'
import type { ButtonProps, ButtonIconProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { CardProps } from '@/components/Common/UI/Card/CardTypes'
import type { BoxProps } from '@/components/Common/UI/Box/BoxTypes'
import type { BoxHeaderProps } from '@/components/Common/UI/BoxHeader/BoxHeaderTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import type { MultiSelectComboBoxProps } from '@/components/Common/UI/MultiSelectComboBox/MultiSelectComboBoxTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import type { DateRangePickerProps } from '@/components/Common/UI/DateRangePicker/DateRangePickerTypes'
import type { OrderedListProps, UnorderedListProps } from '@/components/Common/UI/List/ListTypes'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { TextAreaProps } from '@/components/Common/UI/TextArea/TextAreaTypes'
import type { LinkProps } from '@/components/Common/UI/Link/LinkTypes'
import type { TableProps } from '@/components/Common/UI/Table/TableTypes'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import type { CalendarPreviewProps } from '@/components/Common/UI/CalendarPreview/CalendarPreviewTypes'
import type { ProgressBarProps } from '@/components/Common/UI/ProgressBar/ProgressBarTypes'
import type { BreadcrumbsProps } from '@/components/Common/UI/Breadcrumbs/BreadcrumbsTypes'
import type { TabsProps } from '@/components/Common/UI/Tabs/TabsTypes'
import type { DialogProps } from '@/components/Common/UI/Dialog/DialogTypes'
import type { ModalProps } from '@/components/Common/UI/Modal/ModalTypes'
import type { LoadingSpinnerProps } from '@/components/Common/UI/LoadingSpinner/LoadingSpinnerTypes'
import type { DescriptionListProps } from '@/components/Common/UI/DescriptionList/DescriptionListTypes'
import type { FileInputProps } from '@/components/Common/UI/FileInput/FileInputTypes'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'

const inputStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  padding: '0.375rem 0.625rem',
  fontSize: '0.875rem',
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#111827',
}

function FieldWrapper({
  label,
  errorMessage,
  description,
  isRequired,
  children,
  id,
}: {
  label: React.ReactNode
  errorMessage?: string
  description?: React.ReactNode
  isRequired?: boolean
  children: React.ReactNode
  id?: string
}) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}
    >
      <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
        {label}
        {isRequired && <span style={{ color: '#dc2626', marginLeft: '0.125rem' }}>*</span>}
      </label>
      {description && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{description}</div>}
      {children}
      {errorMessage && <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>{errorMessage}</div>}
    </div>
  )
}

function NativeAlert({ label, children, status }: AlertProps) {
  const alertColors = {
    info: { bg: '#eff6ff', border: '#3b82f6' },
    success: { bg: '#f0fdf4', border: '#22c55e' },
    warning: { bg: '#fffbeb', border: '#f59e0b' },
    error: { bg: '#fef2f2', border: '#ef4444' },
  } satisfies Record<NonNullable<typeof status>, { bg: string; border: string }>
  const s = alertColors[status ?? 'info']
  return (
    <div
      style={{
        background: s.bg,
        borderLeft: `4px solid ${s.border}`,
        padding: '0.75rem 1rem',
        borderRadius: '0.375rem',
        marginBottom: '0.5rem',
      }}
    >
      <strong style={{ fontSize: '0.875rem' }}>{label}</strong>
      {children && <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{children}</div>}
    </div>
  )
}

function NativeBadge({ children, status }: BadgeProps) {
  const badgeColors = {
    info: { bg: '#eff6ff', color: '#1d4ed8' },
    success: { bg: '#f0fdf4', color: '#15803d' },
    warning: { bg: '#fffbeb', color: '#92400e' },
    error: { bg: '#fef2f2', color: '#b91c1c' },
  } satisfies Record<NonNullable<typeof status>, { bg: string; color: string }>
  const s = badgeColors[status ?? 'info']
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: '9999px',
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  )
}

function NativeBanner({ title, children, status }: BannerProps) {
  const headerBg = status === 'error' ? '#ef4444' : '#f59e0b'
  const bg = status === 'error' ? '#fef2f2' : '#fffbeb'
  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        marginBottom: '0.5rem',
      }}
    >
      <div
        style={{
          background: headerBg,
          color: '#fff',
          padding: '0.5rem 1rem',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {title}
      </div>
      <div style={{ background: bg, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
        {children}
      </div>
    </div>
  )
}

function NativeButton({ children, onClick, isDisabled, isLoading, variant, type }: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#2563eb', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#2563eb', border: '1px solid #2563eb' },
    tertiary: { background: 'transparent', color: '#2563eb', border: 'none' },
    error: { background: '#dc2626', color: '#fff', border: 'none' },
  }
  const s = styles[variant ?? 'primary']
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      style={{
        ...s,
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {isLoading ? '…' : children}
    </button>
  )
}

function NativeButtonIcon({
  children,
  onClick,
  isDisabled,
  'aria-label': ariaLabel,
}: ButtonIconProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      style={{
        background: 'transparent',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.375rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function NativeCard({ children, menu, action }: CardProps) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '0.5rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      {action && <div>{action}</div>}
      <div style={{ flex: 1 }}>{children}</div>
      {menu && <div>{menu}</div>}
    </div>
  )
}

function NativeBox({ children, header, footer, withPadding }: BoxProps) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        marginBottom: '0.5rem',
      }}
    >
      {header && (
        <div
          style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1rem', fontWeight: 600 }}
        >
          {header}
        </div>
      )}
      <div style={{ padding: withPadding !== false ? '1rem' : 0 }}>{children}</div>
      {footer && (
        <div
          style={{ borderTop: '1px solid #e5e7eb', padding: '0.75rem 1rem', background: '#f9fafb' }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

function NativeBoxHeader({ title, description, action, headingLevel = 'h3' }: BoxHeaderProps) {
  const Tag = headingLevel
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}
    >
      <div style={{ flex: 1 }}>
        <Tag style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</Tag>
        {description && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {description}
          </div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function NativeCheckbox({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  id,
  name,
}: CheckboxProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        fontSize: '0.875rem',
      }}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={value ?? false}
        onChange={e => onChange?.(e.target.checked)}
        disabled={isDisabled}
        style={{ accentColor: isInvalid ? '#dc2626' : '#2563eb', width: '1rem', height: '1rem' }}
      />
      {label}
    </label>
  )
}

function NativeCheckboxGroup({
  label,
  options,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
}: CheckboxGroupProps) {
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (val: string) => {
    const next = selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]
    setSelected(next)
    onChange?.(next)
  }
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
    >
      <fieldset
        style={{
          border: isInvalid ? '1px solid #dc2626' : '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          margin: 0,
        }}
      >
        <legend style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0 0.25rem' }}>
          {label}
        </legend>
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
              cursor: isDisabled || opt.isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled || opt.isDisabled ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => {
                toggle(opt.value)
              }}
              disabled={isDisabled || opt.isDisabled}
              style={{ accentColor: '#2563eb' }}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>
    </FieldWrapper>
  )
}

function NativeComboBox({
  label,
  options,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
  placeholder,
}: ComboBoxProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <select
        id={id}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={isDisabled}
        style={{ ...inputStyle, borderColor: isInvalid ? '#dc2626' : '#d1d5db' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}

function NativeMultiSelectComboBox({
  label,
  options,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
}: MultiSelectComboBoxProps) {
  const selected = value ?? []
  const toggle = (val: string) => {
    const next = selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]
    onChange?.(next)
  }
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <div
        style={{
          border: isInvalid ? '1px solid #dc2626' : '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
        }}
      >
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              background: selected.includes(opt.value) ? '#dbeafe' : '#f3f4f6',
              borderRadius: '9999px',
              padding: '0.125rem 0.5rem',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => {
                toggle(opt.value)
              }}
              disabled={isDisabled}
              style={{ display: 'none' }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </FieldWrapper>
  )
}

function NativeDatePicker({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
}: DatePickerProps) {
  const dateStr = value ? value.toISOString().slice(0, 10) : ''
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <input
        id={id}
        type="date"
        value={dateStr}
        onChange={e => onChange?.(e.target.value ? new Date(e.target.value) : null)}
        disabled={isDisabled}
        style={{ ...inputStyle, borderColor: isInvalid ? '#dc2626' : '#d1d5db' }}
      />
    </FieldWrapper>
  )
}

function NativeDateRangePicker({
  label,
  value,
  onChange,
  startDateLabel,
  endDateLabel,
}: DateRangePickerProps) {
  const toDateStr = (d: Date | undefined) => d?.toISOString().slice(0, 10) ?? ''
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}
    >
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>{startDateLabel}</label>
          <input
            type="date"
            value={toDateStr(value?.start)}
            onChange={e => {
              const start = e.target.value ? new Date(e.target.value) : null
              if (start && value?.end) onChange({ start, end: value.end })
              else if (!start) onChange(null)
            }}
            style={{ ...inputStyle }}
          />
        </div>
        <span style={{ color: '#9ca3af', marginTop: '1.25rem' }}>–</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>{endDateLabel}</label>
          <input
            type="date"
            value={toDateStr(value?.end)}
            onChange={e => {
              const end = e.target.value ? new Date(e.target.value) : null
              if (end && value?.start) onChange({ start: value.start, end })
              else if (!end) onChange(null)
            }}
            style={{ ...inputStyle }}
          />
        </div>
      </div>
    </div>
  )
}

function NativeOrderedList({ items }: OrderedListProps) {
  return (
    <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          {item}
        </li>
      ))}
    </ol>
  )
}

function NativeUnorderedList({ items }: UnorderedListProps) {
  return (
    <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function NativeNumberInput({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
  placeholder,
  min,
  max,
}: NumberInputProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <input
        id={id}
        type="number"
        value={value ?? ''}
        onChange={e => onChange?.(e.target.valueAsNumber)}
        disabled={isDisabled}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{ ...inputStyle, borderColor: isInvalid ? '#dc2626' : '#d1d5db' }}
      />
    </FieldWrapper>
  )
}

function NativeRadio({ label, value, onChange, isDisabled, isInvalid, id, name }: RadioProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        fontSize: '0.875rem',
      }}
    >
      <input
        type="radio"
        id={id}
        name={name}
        checked={value ?? false}
        onChange={e => onChange?.(e.target.checked)}
        disabled={isDisabled}
        style={{ accentColor: isInvalid ? '#dc2626' : '#2563eb', width: '1rem', height: '1rem' }}
      />
      {label}
    </label>
  )
}

function NativeRadioGroup({
  label,
  options,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
}: RadioGroupProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
    >
      <fieldset
        style={{
          border: isInvalid ? '1px solid #dc2626' : '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          margin: 0,
        }}
      >
        <legend style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0 0.25rem' }}>
          {label}
        </legend>
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
              cursor: isDisabled || opt.isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled || opt.isDisabled ? 0.5 : 1,
            }}
          >
            <input
              type="radio"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={isDisabled || opt.isDisabled}
              style={{ accentColor: '#2563eb' }}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>
    </FieldWrapper>
  )
}

function NativeSelect({
  label,
  options,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
  placeholder,
}: SelectProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <select
        id={id}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={isDisabled}
        style={{ ...inputStyle, borderColor: isInvalid ? '#dc2626' : '#d1d5db' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}

function NativeSwitch({ label, value, onChange, isDisabled, isInvalid, id }: SwitchProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
      }}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={value ?? false}
        onChange={e => onChange?.(e.target.checked)}
        disabled={isDisabled}
        style={{ accentColor: isInvalid ? '#dc2626' : '#2563eb' }}
      />
      {label}
    </label>
  )
}

function NativeTextInput({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
  placeholder,
  type,
}: TextInputProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <input
        id={id}
        type={type ?? 'text'}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: isInvalid ? '#dc2626' : '#d1d5db' }}
      />
    </FieldWrapper>
  )
}

function NativeTextArea({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
  placeholder,
  rows,
}: TextAreaProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <textarea
        id={id}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
        rows={rows ?? 3}
        style={{
          ...inputStyle,
          borderColor: isInvalid ? '#dc2626' : '#d1d5db',
          resize: 'vertical',
        }}
      />
    </FieldWrapper>
  )
}

function NativeLink({ children, href, target, rel, className }: LinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '0.875rem' }}
    >
      {children}
    </a>
  )
}

function NativeMenu({ items, isOpen, onClose, 'aria-label': ariaLabel }: MenuProps) {
  if (!isOpen || !items?.length) return null
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      style={{
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        minWidth: '10rem',
        overflow: 'hidden',
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem"
          disabled={item.isDisabled}
          onClick={() => {
            item.onClick()
            onClose?.()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            background: 'none',
            border: 'none',
            cursor: item.isDisabled ? 'not-allowed' : 'pointer',
            opacity: item.isDisabled ? 0.5 : 1,
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  )
}

function NativeTable({ headers, rows, footer, ...rest }: TableProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} {...rest}>
      <thead>
        <tr>
          {headers.map(h => (
            <th
              key={h.key}
              style={{
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                borderBottom: '2px solid #e5e7eb',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {h.content}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.key} style={{ borderBottom: '1px solid #f3f4f6' }}>
            {row.data.map(cell => (
              <td key={cell.key} style={{ padding: '0.5rem 0.75rem' }}>
                {cell.content}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {footer && (
        <tfoot>
          <tr>
            {footer.map(f => (
              <td
                key={f.key}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontWeight: 600,
                  borderTop: '2px solid #e5e7eb',
                }}
              >
                {f.content}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  )
}

function NativeHeading({ as: Tag, children, className, id }: HeadingProps) {
  const sizes: Record<string, string> = {
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    h4: '1.125rem',
    h5: '1rem',
    h6: '0.875rem',
  }
  return (
    <Tag
      className={className}
      id={id}
      style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: sizes[Tag] }}
    >
      {children}
    </Tag>
  )
}

function NativeText({ as: Tag = 'p', children, size, weight, className, id }: TextProps) {
  const sizes: Record<string, string> = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
  }
  const weights: Record<string, number> = { regular: 400, medium: 500, semibold: 600, bold: 700 }
  return (
    <Tag
      className={className}
      id={id}
      style={{ margin: 0, fontSize: sizes[size ?? 'md'], fontWeight: weights[weight ?? 'regular'] }}
    >
      {children}
    </Tag>
  )
}

function NativeCalendarPreview(_props: CalendarPreviewProps) {
  return (
    <div
      style={{
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontSize: '0.75rem',
        color: '#6b7280',
        textAlign: 'center',
      }}
    >
      Calendar preview
    </div>
  )
}

function NativeProgressBar({ totalSteps, currentStep, label }: ProgressBarProps) {
  const pct = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#6b7280',
          marginBottom: '0.25rem',
        }}
      >
        <span>{label}</span>
        <span>
          {currentStep}/{totalSteps}
        </span>
      </div>
      <div
        style={{
          background: '#e5e7eb',
          borderRadius: '9999px',
          height: '0.5rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#2563eb',
            width: `${pct}%`,
            height: '100%',
            borderRadius: '9999px',
            transition: 'width 0.2s',
          }}
        />
      </div>
    </div>
  )
}

function NativeBreadcrumbs({ breadcrumbs, currentBreadcrumbId, onClick }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        style={{
          display: 'flex',
          gap: '0.25rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.875rem',
        }}
      >
        {breadcrumbs.map((crumb, i) => {
          const isCurrent = crumb.id === currentBreadcrumbId
          const isClickable = crumb.isClickable !== false && !isCurrent && !!onClick
          return (
            <li key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {i > 0 && <span style={{ color: '#9ca3af' }}>›</span>}
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => {
                    onClick!(crumb.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  style={{
                    color: isCurrent ? '#111827' : '#6b7280',
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function NativeTabs({ tabs, selectedId, onSelectionChange }: TabsProps) {
  const [active, setActive] = useState(selectedId ?? tabs[0]?.id)
  const current = selectedId ?? active ?? tabs[0]?.id
  const select = (id: string) => {
    setActive(id)
    onSelectionChange(id)
  }
  const activeTab = tabs.find(t => t.id === current)
  return (
    <div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (!tab.isDisabled) select(tab.id)
            }}
            disabled={tab.isDisabled}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              borderBottom: current === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              color: current === tab.id ? '#2563eb' : '#6b7280',
              cursor: tab.isDisabled ? 'not-allowed' : 'pointer',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '1rem 0' }}>{activeTab?.content}</div>
    </div>
  )
}

function NativeDialog({
  isOpen,
  title,
  children,
  onClose,
  onPrimaryActionClick,
  primaryActionLabel,
  closeActionLabel,
  isDestructive,
  isPrimaryActionLoading,
}: DialogProps) {
  if (!isOpen) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          maxWidth: '32rem',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        {title && (
          <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '1rem' }}>{title}</div>
        )}
        <div style={{ marginBottom: '1.5rem' }}>{children}</div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              background: '#fff',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {closeActionLabel}
          </button>
          <button
            type="button"
            onClick={onPrimaryActionClick}
            disabled={isPrimaryActionLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: isDestructive ? '#dc2626' : '#2563eb',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: isPrimaryActionLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isPrimaryActionLoading ? '…' : primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function NativeModal({ isOpen, onClose, children, footer }: ModalProps) {
  if (!isOpen) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '0.5rem',
          maxWidth: '32rem',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1 }}>{children}</div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: '#6b7280',
                marginLeft: '0.5rem',
              }}
            >
              ×
            </button>
          )}
        </div>
        {footer && (
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

function NativeLoadingSpinner({
  'aria-label': ariaLabel,
  size,
  style: displayStyle,
}: LoadingSpinnerProps) {
  const sz = size === 'sm' ? '1rem' : '2rem'
  const spinner = (
    <div
      role="status"
      aria-label={ariaLabel ?? 'Loading'}
      style={{
        width: sz,
        height: sz,
        border: '2px solid #e5e7eb',
        borderTop: '2px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
  if (displayStyle === 'inline') return spinner
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>{spinner}</div>
}

function NativeDescriptionList({ items, layout = 'stacked' }: DescriptionListProps) {
  return (
    <dl style={{ margin: 0 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: layout === 'horizontal' ? 'flex' : 'block',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <dt
            style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#374151',
              minWidth: layout === 'horizontal' ? '8rem' : undefined,
            }}
          >
            {item.term}
          </dt>
          <dd style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

function NativeFileInput({
  label,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
  id,
  accept,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        disabled={isDisabled}
        accept={accept?.join(',')}
        onChange={e => {
          onChange(e.target.files?.[0] ?? null)
        }}
        style={{ fontSize: '0.875rem', borderColor: isInvalid ? '#dc2626' : undefined }}
      />
    </FieldWrapper>
  )
}

export const nativeComponents: ComponentsContextType = {
  Alert: (props: AlertProps) => <NativeAlert {...props} />,
  Badge: (props: BadgeProps) => <NativeBadge {...props} />,
  Banner: (props: BannerProps) => <NativeBanner {...props} />,
  Button: (props: ButtonProps) => <NativeButton {...props} />,
  ButtonIcon: (props: ButtonIconProps) => <NativeButtonIcon {...props} />,
  Card: (props: CardProps) => <NativeCard {...props} />,
  Box: (props: BoxProps) => <NativeBox {...props} />,
  BoxHeader: (props: BoxHeaderProps) => <NativeBoxHeader {...props} />,
  Checkbox: (props: CheckboxProps) => <NativeCheckbox {...props} />,
  CheckboxGroup: (props: CheckboxGroupProps) => <NativeCheckboxGroup {...props} />,
  ComboBox: (props: ComboBoxProps) => <NativeComboBox {...props} />,
  MultiSelectComboBox: (props: MultiSelectComboBoxProps) => (
    <NativeMultiSelectComboBox {...props} />
  ),
  DatePicker: (props: DatePickerProps) => <NativeDatePicker {...props} />,
  DateRangePicker: (props: DateRangePickerProps) => <NativeDateRangePicker {...props} />,
  OrderedList: (props: OrderedListProps) => <NativeOrderedList {...props} />,
  UnorderedList: (props: UnorderedListProps) => <NativeUnorderedList {...props} />,
  NumberInput: (props: NumberInputProps) => <NativeNumberInput {...props} />,
  Radio: (props: RadioProps) => <NativeRadio {...props} />,
  RadioGroup: (props: RadioGroupProps) => <NativeRadioGroup {...props} />,
  Select: (props: SelectProps) => <NativeSelect {...props} />,
  Switch: (props: SwitchProps) => <NativeSwitch {...props} />,
  TextInput: (props: TextInputProps) => <NativeTextInput {...props} />,
  TextArea: (props: TextAreaProps) => <NativeTextArea {...props} />,
  Link: (props: LinkProps) => <NativeLink {...props} />,
  Menu: (props: MenuProps) => <NativeMenu {...props} />,
  Table: (props: TableProps) => <NativeTable {...props} />,
  Heading: (props: HeadingProps) => <NativeHeading {...props} />,
  Text: (props: TextProps) => <NativeText {...props} />,
  CalendarPreview: (props: CalendarPreviewProps) => <NativeCalendarPreview {...props} />,
  ProgressBar: (props: ProgressBarProps) => <NativeProgressBar {...props} />,
  Breadcrumbs: (props: BreadcrumbsProps) => <NativeBreadcrumbs {...props} />,
  Tabs: (props: TabsProps) => <NativeTabs {...props} />,
  Dialog: (props: DialogProps) => <NativeDialog {...props} />,
  Modal: (props: ModalProps) => <NativeModal {...props} />,
  LoadingSpinner: (props: LoadingSpinnerProps) => <NativeLoadingSpinner {...props} />,
  DescriptionList: (props: DescriptionListProps) => <NativeDescriptionList {...props} />,
  FileInput: (props: FileInputProps) => <NativeFileInput {...props} />,
}
