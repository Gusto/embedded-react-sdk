/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/**
 * Maps embedded-react-sdk's ComponentsContextType to Gusto Workbench components,
 * matching the visual style of embedded-cx-portal.
 */
import type React from 'react'
import { Search } from '@gusto/workbench-icons'
import {
  Button as WbButton,
  Heading as WbHeading,
  Input as WbInput,
  Option as WbOption,
  Select as WbSelect,
  Status as WbStatus,
  StatusSubtext as WbStatusSubtext,
  StatusText as WbStatusText,
  Table as WbTable,
  TableBody as WbTableBody,
  TableDataCell as WbTableDataCell,
  TableHeader as WbTableHeader,
  TableHeaderCell as WbTableHeaderCell,
  TableRow as WbTableRow,
  TableSection as WbTableSection,
  Tag as WbTag,
} from '@gusto/workbench'
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

// ─── Variant maps ────────────────────────────────────────────────────────────

const BUTTON_VARIANT: Record<string, 'primary' | 'secondary' | 'link' | 'destructive'> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'link',
  error: 'destructive',
}

const TAG_SEVERITY: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
}

// ─── Shared field wrapper (used for inputs without a Workbench equivalent) ───

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
      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}
    >
      <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1c1c1c' }}>
        {label}
        {isRequired && <span style={{ color: '#ef523c', marginLeft: '0.125rem' }}>*</span>}
      </label>
      {description && <div style={{ fontSize: '0.75rem', color: '#6c6c72' }}>{description}</div>}
      {children}
      {errorMessage && <div style={{ fontSize: '0.75rem', color: '#ef523c' }}>{errorMessage}</div>}
    </div>
  )
}

// ─── Component implementations ───────────────────────────────────────────────

function CxpAlert({ label, children, status }: AlertProps) {
  return (
    <WbStatus variant={STATUS_VARIANT[status ?? 'info']}>
      <WbStatusText>{label}</WbStatusText>
      {children && <WbStatusSubtext>{children as React.ReactNode}</WbStatusSubtext>}
    </WbStatus>
  )
}

function CxpBadge({ children, status }: BadgeProps) {
  return <WbTag severity={TAG_SEVERITY[status ?? 'info']}>{children}</WbTag>
}

function CxpBanner({ title, children, status }: BannerProps) {
  return (
    <WbStatus variant={STATUS_VARIANT[status ?? 'info']}>
      <WbStatusText>{title}</WbStatusText>
      {children && <WbStatusSubtext>{children as React.ReactNode}</WbStatusSubtext>}
    </WbStatus>
  )
}

function CxpButton({ children, onClick, isDisabled, isLoading, variant, type }: ButtonProps) {
  return (
    <WbButton
      type={type ?? 'button'}
      variant={BUTTON_VARIANT[variant ?? 'primary']}
      onClick={onClick as any}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? '…' : children}
    </WbButton>
  )
}

function CxpButtonIcon({
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
        border: '1px solid var(--color-salt-500, #dcdcdc)',
        borderRadius: 'var(--border-radius-400, 4px)',
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

function CxpCard({ children, menu, action }: CardProps) {
  return (
    <div
      style={{
        border: '1px solid var(--color-salt-400, #eaeaea)',
        borderRadius: 'var(--border-radius-500, 0.5rem)',
        padding: '1rem',
        marginBottom: '0.5rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        background: 'var(--color-salt-100, #fff)',
      }}
    >
      {action && <div>{action}</div>}
      <div style={{ flex: 1 }}>{children}</div>
      {menu && <div>{menu}</div>}
    </div>
  )
}

function CxpBox({ children, footer, withPadding }: BoxProps) {
  return (
    <div
      style={{
        border: '1px solid var(--color-salt-400, #eaeaea)',
        borderRadius: 'var(--border-radius-500, 0.5rem)',
        overflow: 'hidden',
        marginBottom: '0.5rem',
        background: 'var(--color-salt-100, #fff)',
      }}
    >
      <div style={{ padding: withPadding !== false ? '1rem' : 0 }}>{children}</div>
      {footer && (
        <div
          style={{
            borderTop: '1px solid var(--color-salt-400, #eaeaea)',
            padding: '0.75rem 1rem',
            background: 'var(--color-salt-200, #fbfafa)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

function CxpBoxHeader({ title, description, action, headingLevel = 'h3' }: BoxHeaderProps) {
  const level = parseInt(headingLevel.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--color-salt-400, #eaeaea)',
      }}
    >
      <div style={{ flex: 1 }}>
        <WbHeading level={level}>{title}</WbHeading>
        {description && (
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-salt-800, #6c6c72)',
              marginTop: '0.25rem',
            }}
          >
            {description}
          </div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function CxpCheckbox({ label, value, onChange, isDisabled, id, name }: CheckboxProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={value ?? false}
        onChange={e => onChange?.(e.target.checked)}
        disabled={isDisabled}
        style={{ accentColor: 'var(--color-kale-500, #0a8080)', width: '1rem', height: '1rem' }}
      />
      {label}
    </label>
  )
}

function CxpCheckboxGroup({
  label,
  options,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
}: CheckboxGroupProps) {
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          border: isInvalid ? '1px solid #ef523c' : '1px solid var(--color-salt-500, #dcdcdc)',
          borderRadius: 4,
          padding: '0.5rem 0.75rem',
        }}
      >
        {options.map(opt => (
          <label
            key={opt.value}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <input
              type="checkbox"
              onChange={e => {
                const next = e.target.checked ? [opt.value] : []
                onChange?.(next)
              }}
              disabled={isDisabled || opt.isDisabled}
              style={{ accentColor: 'var(--color-kale-500, #0a8080)' }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </FieldWrapper>
  )
}

function CxpComboBox({
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
      <WbSelect
        id={id}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value)}
        disabled={isDisabled}
      >
        {placeholder && <WbOption value="">{placeholder}</WbOption>}
        {options.map(opt => (
          <WbOption key={opt.value} value={opt.value}>
            {opt.label}
          </WbOption>
        ))}
      </WbSelect>
    </FieldWrapper>
  )
}

function CxpMultiSelectComboBox({
  label,
  options,
  value,
  onChange,
  isDisabled,
  isInvalid,
  errorMessage,
  description,
  isRequired,
}: MultiSelectComboBoxProps) {
  const selected = value ?? []
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
    >
      <div
        style={{
          border: isInvalid ? '1px solid #ef523c' : '1px solid var(--color-salt-500, #dcdcdc)',
          borderRadius: 4,
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
              background: selected.includes(opt.value)
                ? 'var(--color-kale-200, #e0f2f5)'
                : 'var(--color-salt-300, #f4f4f3)',
              borderRadius: 9999,
              padding: '0.125rem 0.5rem',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={e => {
                const next = e.target.checked
                  ? [...selected, opt.value]
                  : selected.filter(v => v !== opt.value)
                onChange?.(next)
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

function CxpDatePicker({
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
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <WbInput
        id={id}
        type="date"
        value={value ? value.toISOString().slice(0, 10) : ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value ? new Date(e.target.value) : null)
        }
        disabled={isDisabled}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  )
}

function CxpDateRangePicker({
  label,
  value,
  onChange,
  startDateLabel,
  endDateLabel,
}: DateRangePickerProps) {
  const toStr = (d: Date | undefined) => d?.toISOString().slice(0, 10) ?? ''
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}
    >
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-salt-800, #6c6c72)' }}>
            {startDateLabel}
          </label>
          <WbInput
            type="date"
            value={toStr(value?.start)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const s = e.target.value ? new Date(e.target.value) : null
              if (s && value?.end) onChange({ start: s, end: value.end })
              else if (!s) onChange(null)
            }}
            aria-label={startDateLabel ?? 'Start date'}
          />
        </div>
        <span style={{ color: 'var(--color-salt-700, #919197)', marginTop: '1.25rem' }}>–</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-salt-800, #6c6c72)' }}>
            {endDateLabel}
          </label>
          <WbInput
            type="date"
            value={toStr(value?.end)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const end = e.target.value ? new Date(e.target.value) : null
              if (end && value?.start) onChange({ start: value.start, end })
              else if (!end) onChange(null)
            }}
            aria-label={endDateLabel ?? 'End date'}
          />
        </div>
      </div>
    </div>
  )
}

function CxpOrderedList({ items }: OrderedListProps) {
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

function CxpUnorderedList({ items }: UnorderedListProps) {
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

function CxpNumberInput({
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
      <WbInput
        id={id}
        type="number"
        value={value?.toString() ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.valueAsNumber)}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        min={min}
        max={max}
        aria-label={typeof label === 'string' ? label : undefined}
      />
    </FieldWrapper>
  )
}

function CxpRadio({ label, value, onChange, isDisabled, id, name }: RadioProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <input
        type="radio"
        id={id}
        name={name}
        checked={value ?? false}
        onChange={e => onChange?.(e.target.checked)}
        disabled={isDisabled}
        style={{ accentColor: 'var(--color-kale-500, #0a8080)' }}
      />
      {label}
    </label>
  )
}

function CxpRadioGroup({
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          border: isInvalid ? '1px solid #ef523c' : '1px solid var(--color-salt-500, #dcdcdc)',
          borderRadius: 4,
          padding: '0.5rem 0.75rem',
        }}
      >
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              opacity: isDisabled || opt.isDisabled ? 0.5 : 1,
            }}
          >
            <input
              type="radio"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={isDisabled || opt.isDisabled}
              style={{ accentColor: 'var(--color-kale-500, #0a8080)' }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </FieldWrapper>
  )
}

function CxpSelect({
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
  // Filter/sort selects (no required marker, no error, no description) render without a label wrapper,
  // matching CXP's compact filter row pattern. The label becomes an aria-label only.
  const isFilterSelect = !isRequired && !errorMessage && !description
  if (isFilterSelect) {
    return (
      <WbSelect
        id={id}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value)}
        disabled={isDisabled}
        aria-label={typeof label === 'string' ? label : undefined}
        aria-invalid={isInvalid}
      >
        {options.map(opt => (
          <WbOption key={opt.value} value={opt.value}>
            {opt.label}
          </WbOption>
        ))}
      </WbSelect>
    )
  }
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <WbSelect
        id={id}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value)}
        disabled={isDisabled}
        aria-invalid={isInvalid}
      >
        {placeholder && <WbOption value="">{placeholder}</WbOption>}
        {options.map(opt => (
          <WbOption key={opt.value} value={opt.value}>
            {opt.label}
          </WbOption>
        ))}
      </WbSelect>
    </FieldWrapper>
  )
}

function CxpSwitch({ label, value, onChange, isDisabled, id }: SwitchProps) {
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
        style={{ accentColor: 'var(--color-kale-500, #0a8080)' }}
      />
      {label}
    </label>
  )
}

function CxpTextInput({
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
      <WbInput
        id={id}
        type={type === 'search' ? 'text' : (type ?? 'text')}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        aria-label={typeof label === 'string' ? label : undefined}
        before={type === 'search' ? <Search aria-hidden /> : undefined}
      />
    </FieldWrapper>
  )
}

function CxpTextArea({
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
          border: isInvalid ? '1px solid #ef523c' : '1px solid var(--color-salt-500, #dcdcdc)',
          borderRadius: 'var(--border-radius-400, 4px)',
          padding: '0.375rem 0.625rem',
          fontSize: '0.875rem',
          width: '100%',
          boxSizing: 'border-box',
          resize: 'vertical',
        }}
      />
    </FieldWrapper>
  )
}

function CxpLink({ children, href, target, rel, className }: LinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={{
        color: 'var(--color-kale-500, #0a8080)',
        textDecoration: 'underline',
        fontSize: '0.875rem',
      }}
    >
      {children}
    </a>
  )
}

function CxpMenu({ items, isOpen, onClose, 'aria-label': ariaLabel }: MenuProps) {
  if (!isOpen || !items?.length) return null
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      style={{
        background: '#fff',
        border: '1px solid var(--color-salt-400, #eaeaea)',
        borderRadius: 'var(--border-radius-400, 4px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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

function CxpTable({ headers, rows, footer, emptyState }: TableProps) {
  return (
    <WbTableSection aria-label="Data table">
      <WbTable>
        <WbTableHeader>
          <WbTableRow>
            {headers.map(h => (
              <WbTableHeaderCell key={h.key}>{h.content}</WbTableHeaderCell>
            ))}
          </WbTableRow>
        </WbTableHeader>
        <WbTableBody>
          {rows.length === 0 && emptyState ? (
            <WbTableRow>
              <WbTableDataCell colSpan={headers.length}>{emptyState}</WbTableDataCell>
            </WbTableRow>
          ) : (
            rows.map(row => (
              <WbTableRow key={row.key}>
                {row.data.map(cell => (
                  <WbTableDataCell key={cell.key}>{cell.content}</WbTableDataCell>
                ))}
              </WbTableRow>
            ))
          )}
        </WbTableBody>
        {footer && (
          <tfoot>
            <WbTableRow>
              {footer.map(f => (
                <WbTableDataCell key={f.key}>{f.content}</WbTableDataCell>
              ))}
            </WbTableRow>
          </tfoot>
        )}
      </WbTable>
    </WbTableSection>
  )
}

function CxpHeading({ as, children, className, id }: HeadingProps) {
  const level = as ? (parseInt(as.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6) : 2
  return (
    <WbHeading level={level} className={className} id={id}>
      {children}
    </WbHeading>
  )
}

function CxpText({ as: Tag = 'p', children, size, weight, variant, className, id }: TextProps) {
  const sizes: Record<string, string> = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
  }
  const weights: Record<string, number> = { regular: 400, medium: 500, semibold: 600, bold: 700 }
  const color = variant === 'supporting' ? 'var(--color-salt-800, #6c6c72)' : 'inherit'
  return (
    <Tag
      className={className}
      id={id}
      style={{
        margin: 0,
        fontSize: sizes[size ?? 'md'],
        fontWeight: weights[weight ?? 'regular'],
        color,
      }}
    >
      {children}
    </Tag>
  )
}

function CxpCalendarPreview(_props: CalendarPreviewProps) {
  return (
    <div
      style={{
        background: 'var(--color-salt-300, #f4f4f3)',
        border: '1px solid var(--color-salt-400, #eaeaea)',
        borderRadius: 'var(--border-radius-500, 0.5rem)',
        padding: '1rem',
        fontSize: '0.75rem',
        color: 'var(--color-salt-800, #6c6c72)',
        textAlign: 'center',
      }}
    >
      Calendar preview
    </div>
  )
}

function CxpProgressBar({ totalSteps, currentStep, label }: ProgressBarProps) {
  const pct = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--color-salt-800, #6c6c72)',
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
          background: 'var(--color-salt-400, #eaeaea)',
          borderRadius: 9999,
          height: '0.5rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'var(--color-kale-500, #0a8080)',
            width: `${pct}%`,
            height: '100%',
            borderRadius: 9999,
            transition: 'width 0.2s',
          }}
        />
      </div>
    </div>
  )
}

function CxpBreadcrumbs({ breadcrumbs, currentBreadcrumbId, onClick }: BreadcrumbsProps) {
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
              {i > 0 && <span style={{ color: 'var(--color-salt-600, #bababc)' }}>›</span>}
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
                    color: 'var(--color-kale-500, #0a8080)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  style={{
                    color: isCurrent
                      ? 'var(--color-salt-1000, #1c1c1c)'
                      : 'var(--color-salt-800, #6c6c72)',
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

function CxpTabs({ tabs, selectedId, onSelectionChange }: TabsProps) {
  const [active, setActive] = React.useState(selectedId ?? tabs[0]?.id)
  const current = selectedId ?? active ?? tabs[0]?.id
  const select = (id: string) => {
    setActive(id)
    onSelectionChange(id)
  }
  const activeTab = tabs.find(t => t.id === current)
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '2px solid var(--color-salt-400, #eaeaea)' }}>
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
              borderBottom:
                current === tab.id
                  ? '2px solid var(--color-kale-500, #0a8080)'
                  : '2px solid transparent',
              color:
                current === tab.id
                  ? 'var(--color-kale-500, #0a8080)'
                  : 'var(--color-salt-800, #6c6c72)',
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

function CxpDialog({
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
          borderRadius: 'var(--border-radius-500, 0.5rem)',
          padding: '1.5rem',
          maxWidth: '32rem',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        {title && (
          <div
            style={{
              fontWeight: 600,
              fontSize: '1.125rem',
              marginBottom: '1rem',
              color: 'var(--color-salt-1000, #1c1c1c)',
            }}
          >
            {title}
          </div>
        )}
        <div style={{ marginBottom: '1.5rem' }}>{children}</div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <WbButton type="button" variant="secondary" onClick={onClose as any}>
            {closeActionLabel}
          </WbButton>
          <WbButton
            type="button"
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={onPrimaryActionClick as any}
            disabled={isPrimaryActionLoading}
          >
            {isPrimaryActionLoading ? '…' : primaryActionLabel}
          </WbButton>
        </div>
      </div>
    </div>
  )
}

function CxpModal({ isOpen, onClose, children, footer }: ModalProps) {
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
          borderRadius: 'var(--border-radius-500, 0.5rem)',
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
                color: 'var(--color-salt-700, #919197)',
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
              borderTop: '1px solid var(--color-salt-400, #eaeaea)',
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

function CxpLoadingSpinner({
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
        border: '2px solid var(--color-salt-400, #eaeaea)',
        borderTop: `2px solid var(--color-kale-500, #0a8080)`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
  if (displayStyle === 'inline') return spinner
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>{spinner}</div>
}

function CxpDescriptionList({ items, layout = 'stacked' }: DescriptionListProps) {
  return (
    <dl style={{ margin: 0, borderTop: '1px solid var(--color-salt-400, #eaeaea)' }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: layout === 'horizontal' ? 'flex' : 'block',
            gap: '1rem',
            padding: '0.75rem 0',
            borderBottom: '1px solid var(--color-salt-400, #eaeaea)',
          }}
        >
          <dt
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-salt-800, #6c6c72)',
              minWidth: layout === 'horizontal' ? '10rem' : undefined,
              flexShrink: 0,
            }}
          >
            {item.term}
          </dt>
          <dd
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--color-salt-1000, #1c1c1c)',
              fontWeight: 500,
            }}
          >
            {item.description}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function CxpFileInput({
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
  return (
    <FieldWrapper
      label={label}
      errorMessage={errorMessage}
      description={description}
      isRequired={isRequired}
      id={id}
    >
      <input
        ref={null}
        id={id}
        type="file"
        disabled={isDisabled}
        accept={accept?.join(',')}
        onChange={e => {
          onChange(e.target.files?.[0] ?? null)
        }}
        style={{ fontSize: '0.875rem', borderColor: isInvalid ? '#ef523c' : undefined }}
      />
    </FieldWrapper>
  )
}

// ─── Exported component map ───────────────────────────────────────────────────

export const cxPortalComponents: ComponentsContextType = {
  Alert: (props: AlertProps) => <CxpAlert {...props} />,
  Badge: (props: BadgeProps) => <CxpBadge {...props} />,
  Banner: (props: BannerProps) => <CxpBanner {...props} />,
  Button: (props: ButtonProps) => <CxpButton {...props} />,
  ButtonIcon: (props: ButtonIconProps) => <CxpButtonIcon {...props} />,
  Card: (props: CardProps) => <CxpCard {...props} />,
  Box: (props: BoxProps) => <CxpBox {...props} />,
  BoxHeader: (props: BoxHeaderProps) => <CxpBoxHeader {...props} />,
  Checkbox: (props: CheckboxProps) => <CxpCheckbox {...props} />,
  CheckboxGroup: (props: CheckboxGroupProps) => <CxpCheckboxGroup {...props} />,
  ComboBox: (props: ComboBoxProps) => <CxpComboBox {...props} />,
  MultiSelectComboBox: (props: MultiSelectComboBoxProps) => <CxpMultiSelectComboBox {...props} />,
  DatePicker: (props: DatePickerProps) => <CxpDatePicker {...props} />,
  DateRangePicker: (props: DateRangePickerProps) => <CxpDateRangePicker {...props} />,
  OrderedList: (props: OrderedListProps) => <CxpOrderedList {...props} />,
  UnorderedList: (props: UnorderedListProps) => <CxpUnorderedList {...props} />,
  NumberInput: (props: NumberInputProps) => <CxpNumberInput {...props} />,
  Radio: (props: RadioProps) => <CxpRadio {...props} />,
  RadioGroup: (props: RadioGroupProps) => <CxpRadioGroup {...props} />,
  Select: (props: SelectProps) => <CxpSelect {...props} />,
  Switch: (props: SwitchProps) => <CxpSwitch {...props} />,
  TextInput: (props: TextInputProps) => <CxpTextInput {...props} />,
  TextArea: (props: TextAreaProps) => <CxpTextArea {...props} />,
  Link: (props: LinkProps) => <CxpLink {...props} />,
  Menu: (props: MenuProps) => <CxpMenu {...props} />,
  Table: (props: TableProps) => <CxpTable {...props} />,
  Heading: (props: HeadingProps) => <CxpHeading {...props} />,
  Text: (props: TextProps) => <CxpText {...props} />,
  CalendarPreview: (props: CalendarPreviewProps) => <CxpCalendarPreview {...props} />,
  ProgressBar: (props: ProgressBarProps) => <CxpProgressBar {...props} />,
  Breadcrumbs: (props: BreadcrumbsProps) => <CxpBreadcrumbs {...props} />,
  Tabs: (props: TabsProps) => <CxpTabs {...props} />,
  Dialog: (props: DialogProps) => <CxpDialog {...props} />,
  Modal: (props: ModalProps) => <CxpModal {...props} />,
  LoadingSpinner: (props: LoadingSpinnerProps) => <CxpLoadingSpinner {...props} />,
  DescriptionList: (props: DescriptionListProps) => <CxpDescriptionList {...props} />,
  FileInput: (props: FileInputProps) => <CxpFileInput {...props} />,
}
