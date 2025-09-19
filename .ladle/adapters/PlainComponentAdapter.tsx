import React from 'react'
import type { TextInputProps } from '../../src/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '../../src/components/Common/UI/NumberInput/NumberInputTypes'
import type { CardProps } from '../../src/components/Common/UI/Card/CardTypes'
import type { CheckboxGroupProps } from '../../src/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { ComboBoxProps } from '../../src/components/Common/UI/ComboBox/ComboBoxTypes'
import type { CheckboxProps } from '../../src/components/Common/UI/Checkbox/CheckboxTypes'
import type { DatePickerProps } from '../../src/components/Common/UI/DatePicker/DatePickerTypes'
import type { LinkProps } from '../../src/components/Common/UI/Link/LinkTypes'
import type { RadioProps } from '../../src/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '../../src/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SelectProps } from '../../src/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '../../src/components/Common/UI/Switch/SwitchTypes'
import type { AlertProps } from '../../src/components/Common/UI/Alert/AlertTypes'
import type { BadgeProps } from '../../src/components/Common/UI/Badge/BadgeTypes'
import type {
  OrderedListProps,
  UnorderedListProps,
} from '../../src/components/Common/UI/List/ListTypes'
import type {
  ButtonIconProps,
  ButtonProps,
} from '../../src/components/Common/UI/Button/ButtonTypes'
import type { TabsProps } from '../../src/components/Common/UI/Tabs/TabsTypes'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import type { ProgressBarProps } from '@/components/Common/UI/ProgressBar/ProgressBarTypes'
import type { TableProps, TableData, TableRow } from '@/components/Common/UI/Table/TableTypes'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import type { CalendarPreviewProps } from '@/components/Common/UI/CalendarPreview/CalendarPreviewTypes'
import type { DialogProps } from '@/components/Common/UI/Dialog/DialogTypes'

export const PlainComponentAdapter: ComponentsContextType = {
  Alert: ({ label, children, status = 'info', icon }: AlertProps) => {
    return (
      <div
        className={`sdk-alert sdk-alert-${status}`}
        role="alert"
        aria-labelledby={label ? 'alert-label' : undefined}
      >
        <div className="sdk-alert-container">
          {icon && <span className="sdk-alert-icon">{icon}</span>}
          <div className="sdk-alert-content">
            {label && (
              <div id="alert-label" className="sdk-alert-label">
                {label}
              </div>
            )}
            {children && <div className="sdk-alert-message">{children}</div>}
          </div>
        </div>
      </div>
    )
  },
  ProgressBar: ({ currentStep, label, totalSteps, className }: ProgressBarProps) => {
    return (
      <div className={className}>
        <progress aria-label={label} value={currentStep} max={totalSteps}></progress>
      </div>
    )
  },
  Button: ({
    isLoading = false,
    isDisabled = false,
    buttonRef,
    onClick,
    children,
    ...props
  }: ButtonProps) => {
    // Implement a simple button without the complex event translations
    return (
      <button
        ref={buttonRef}
        disabled={isDisabled || isLoading}
        onClick={onClick}
        className={`button button-primary ${isLoading ? 'button-loading' : ''}`}
        {...props}
      >
        {isLoading ? <span className="button-loading-indicator">{children}</span> : children}
      </button>
    )
  },

  ButtonIcon: ({
    isLoading = false,
    isDisabled = false,
    buttonRef,
    onClick,
    children,
    ...props
  }: ButtonIconProps) => {
    return (
      <button
        ref={buttonRef}
        disabled={isDisabled || isLoading}
        onClick={onClick}
        className={`button button-icon ${isLoading ? 'button-loading' : ''}`}
        {...props}
      >
        {isLoading ? <span className="button-loading-indicator">{children}</span> : children}
      </button>
    )
  },

  Card: ({ children, menu, className }: CardProps) => {
    return (
      <div className={`card ${className || ''}`}>
        <div className="card-content">
          <div className="card-main">{children}</div>
          {menu && <div className="card-menu">{menu}</div>}
        </div>
      </div>
    )
  },

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
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    return (
      <div className="field-layout">
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        <input
          type="text"
          id={inputId}
          name={name}
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedby}
          onChange={e => {
            onChange && onChange(e.target.value)
          }}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        />
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    return (
      <div className="field-layout">
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
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
          aria-describedby={ariaDescribedby}
          onChange={e => {
            onChange && onChange(parseFloat(e.target.value))
          }}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        />
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    return (
      <div className="horizontal-field-layout">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          ref={inputRef}
          checked={!!value}
          value={typeof value === 'boolean' ? String(value) : value}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedby}
          onChange={e => {
            onChange && onChange(e.target.checked)
          }}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        />
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${fieldsetId}-description` : undefined
    const errorMessageId = errorMessage ? `${fieldsetId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return

      const optionValue = e.target.value
      const isChecked = e.target.checked

      if (isChecked) {
        onChange([...value, optionValue])
      } else {
        onChange(value.filter(v => v !== optionValue))
      }
    }

    return (
      <fieldset
        className="field-layout"
        disabled={isDisabled}
        aria-describedby={ariaDescribedby}
        aria-invalid={isInvalid}
        {...props}
      >
        {!shouldVisuallyHideLabel && (
          <legend>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </legend>
        )}
        {shouldVisuallyHideLabel && (
          <legend className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </legend>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        <div className="checkbox-group">
          {options.map((option, index) => (
            <div className="checkbox-option" key={option.value}>
              <input
                type="checkbox"
                id={`${fieldsetId}-${option.value}`}
                value={option.value}
                checked={value.includes(option.value)}
                disabled={isDisabled || option.isDisabled}
                onChange={handleChange}
                ref={index === 0 ? inputRef : undefined}
              />
              <label htmlFor={`${fieldsetId}-${option.value}`}>{option.label}</label>
              {option.description && <div className="option-description">{option.description}</div>}
            </div>
          ))}
        </div>
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </fieldset>
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
    const listId = `${inputId}-options`
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby =
      [descriptionId, errorMessageId, listId].filter(Boolean).join(' ') || undefined

    return (
      <div className="field-layout">
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        <input
          type="text"
          id={inputId}
          name={name}
          ref={inputRef}
          value={value || ''}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedby}
          list={listId}
          onChange={e => {
            onChange && onChange(e.target.value)
          }}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        />
        <datalist id={listId}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    // Format date as YYYY-MM-DD for HTML date input
    const formatDate = (date?: Date | null) => {
      if (!date) return ''
      return date.toISOString().split('T')[0]
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return

      const dateStr = e.target.value
      if (!dateStr) {
        onChange(null)
        return
      }

      const date = new Date(dateStr)
      onChange(date)
    }

    return (
      <div className="field-layout">
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        <input
          type="date"
          id={inputId}
          name={name}
          ref={inputRef}
          value={formatDate(value)}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedby}
          onChange={handleChange}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        />
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    return (
      <div className="horizontal-field-layout">
        <input
          type="radio"
          id={inputId}
          name={name}
          ref={inputRef}
          checked={!!value}
          value={typeof value === 'boolean' ? String(value) : value}
          disabled={isDisabled}
          aria-describedby={ariaDescribedby}
          onChange={e => {
            onChange && onChange(e.target.checked)
          }}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        />
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${fieldsetId}-description` : undefined
    const errorMessageId = errorMessage ? `${fieldsetId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <fieldset
        className="field-layout"
        disabled={isDisabled}
        aria-describedby={ariaDescribedby}
        aria-invalid={isInvalid}
        {...props}
      >
        {!shouldVisuallyHideLabel && (
          <legend>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </legend>
        )}
        {shouldVisuallyHideLabel && (
          <legend className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </legend>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        <div className="radio-group">
          {options.map((option, index) => (
            <div className="radio-option" key={option.value}>
              <input
                type="radio"
                id={`${fieldsetId}-${option.value}`}
                name={fieldsetId}
                value={option.value}
                checked={value === option.value}
                disabled={isDisabled || option.isDisabled}
                onChange={handleChange}
                ref={index === 0 ? inputRef : undefined}
              />
              <label htmlFor={`${fieldsetId}-${option.value}`}>{option.label}</label>
              {option.description && <div className="option-description">{option.description}</div>}
            </div>
          ))}
        </div>
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </fieldset>
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
    const descriptionId = description ? `${selectId}-description` : undefined
    const errorMessageId = errorMessage ? `${selectId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange && onChange(e.target.value)
    }

    return (
      <div className="field-layout">
        {!shouldVisuallyHideLabel && (
          <label htmlFor={selectId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={selectId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        <select
          id={selectId}
          name={name}
          ref={inputRef as React.Ref<HTMLSelectElement>}
          value={value || ''}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedby}
          onChange={handleChange}
          onBlur={onBlur}
          required={isRequired}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
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
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorMessageId = errorMessage ? `${inputId}-error` : undefined
    const ariaDescribedby = [descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked)
      }
    }

    return (
      <div className="horizontal-field-layout">
        <label className="switch">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            ref={inputRef}
            checked={!!value}
            value={typeof value === 'boolean' ? String(value) : value}
            disabled={isDisabled}
            aria-invalid={isInvalid}
            aria-describedby={ariaDescribedby}
            onChange={handleChange}
            onBlur={onBlur}
            required={isRequired}
            {...props}
          />
          <span className="slider"></span>
        </label>
        {!shouldVisuallyHideLabel && (
          <label htmlFor={inputId}>
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {shouldVisuallyHideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span aria-hidden="true"> *</span>}
          </label>
        )}
        {description && <div id={descriptionId}>{description}</div>}
        {errorMessage && (
          <div id={errorMessageId} className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
    )
  },
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  Link: (props: LinkProps) => <a {...props} />,

  Badge: ({ children, status: variant, ...props }: BadgeProps) => {
    return (
      <span className={`badge ${variant ? `badge-${variant}` : ''}`} {...props}>
        {children}
      </span>
    )
  },
  Menu: ({
    triggerRef,
    items = [],
    isOpen = false,
    onClose,
    'aria-label': ariaLabel,
  }: MenuProps) => {
    if (!isOpen) return null

    // Basic HTML implementation of menu
    return (
      <div className="menu" role="menu" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <div
            key={index}
            role="menuitem"
            tabIndex={0}
            onClick={() => {
              if (!item.isDisabled) {
                item.onClick()
                onClose?.()
              }
            }}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && !item.isDisabled) {
                e.preventDefault()
                item.onClick()
                onClose?.()
              }
            }}
            aria-disabled={item.isDisabled}
          >
            {item.icon && (
              <span className="menu-icon" style={{ marginRight: '8px' }}>
                {item.icon}
              </span>
            )}
            {item.href ? (
              <a
                href={item.href}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {item.label}
              </a>
            ) : (
              item.label
            )}
          </div>
        ))}
      </div>
    )
  },

  Table: ({
    headers,
    rows,
    className,
    'aria-label': ariaLabel,
    emptyState,
    ...props
  }: TableProps) => {
    return (
      <table className={className} aria-label={ariaLabel} {...props}>
        <thead>
          <tr>
            {headers.map((header: TableData) => (
              <th key={header.key}>{header.content}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && emptyState ? (
            <tr>
              <td colSpan={headers.length}>{emptyState}</td>
            </tr>
          ) : (
            rows.map((row: TableRow) => (
              <tr key={row.key}>
                {row.data.map((cell: TableData) => (
                  <td key={cell.key}>{cell.content}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  },

  OrderedList: ({ items, className, ...props }: OrderedListProps) => {
    return (
      <ol className={`list ordered-list ${className || ''}`} {...props}>
        {items.map((item, index) => (
          <li key={index} className="list-item">
            {item}
          </li>
        ))}
      </ol>
    )
  },

  UnorderedList: ({ items, className, ...props }: UnorderedListProps) => {
    return (
      <ul className={`list unordered-list ${className || ''}`} {...props}>
        {items.map((item, index) => (
          <li key={index} className="list-item">
            {item}
          </li>
        ))}
      </ul>
    )
  },

  Heading: ({ as: Component, styledAs, textAlign, children }: HeadingProps) => {
    const levelStyles = styledAs ?? Component

    const fontSizes = {
      h1: '2rem',
      h2: '1.5rem',
      h3: '1.25rem',
      h4: '1rem',
      h5: '0.875rem',
      h6: '0.75rem',
    }

    const headingStyles = {
      textAlign: textAlign,
      fontSize: fontSizes[levelStyles],
    }

    return <Component style={headingStyles}>{children}</Component>
  },
  PaginationControl: ({
    currentPage,
    totalPages,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage,
    handleItemsPerPageChange,
  }: PaginationControlProps) => {
    if (totalPages < 2) {
      return null
    }

    return (
      <section className="pagination-control" data-testid="pagination-control">
        <div className="pagination-container">
          <div className="pagination-control-count">
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              onChange={e => {
                handleItemsPerPageChange(Number(e.target.value))
              }}
              defaultValue="5"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="pagination-control-buttons">
            <button
              aria-label="Go to first page"
              disabled={currentPage === 1}
              onClick={handleFirstPage}
              className="pagination-button"
            >
              &laquo;
            </button>
            <button
              aria-label="Go to previous page"
              data-testid="pagination-previous"
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
              className="pagination-button"
            >
              &lsaquo;
            </button>
            <button
              aria-label="Go to next page"
              data-testid="pagination-next"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              className="pagination-button"
            >
              &rsaquo;
            </button>
            <button
              aria-label="Go to last page"
              disabled={currentPage === totalPages}
              onClick={handleLastPage}
              className="pagination-button"
            >
              &raquo;
            </button>
          </div>
        </div>
      </section>
    )
  },
  Text: ({ as: Component, size = 'md', textAlign, weight, className, children }: TextProps) => {
    const fontSizes = {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    }

    const fontWeights = {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }

    const textStyles = {
      margin: 0,
      fontSize: fontSizes[size],
      lineHeight: '1.5',
      textAlign: textAlign,
      fontWeight: weight ? fontWeights[weight] : fontWeights.regular,
    }

    const ElementType = Component as React.ElementType
    return (
      <ElementType style={textStyles} className={className}>
        {children}
      </ElementType>
    )
  },

  CalendarPreview: ({ dateRange, highlightDates }: CalendarPreviewProps) => {
    // Format dates for display
    const formatDate = (date: Date) => {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    return (
      <div>
        <div>
          <strong>{dateRange.label}:</strong>
        </div>
        <div>
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </div>

        {highlightDates && highlightDates.length > 0 && (
          <ul>
            {highlightDates.map((highlight, index) => (
              <li key={index}>
                {formatDate(highlight.date)} - {highlight.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },

  Tabs: ({ tabs, selectedId, onSelectionChange, className }: TabsProps) => {
    const [activeTab, setActiveTab] = React.useState(selectedId || tabs[0]?.id || '')

    const currentTab = selectedId || activeTab
    const selectedTabContent = tabs.find(tab => tab.id === currentTab)?.content

    const handleTabClick = (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId)
      if (tab?.isDisabled) return

      if (!selectedId) {
        setActiveTab(tabId)
      }
      onSelectionChange(tabId)
    }

    return (
      <div className={`plain-tabs ${className || ''}`}>
        <div className="plain-tabs-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`plain-tab ${currentTab === tab.id ? 'active' : ''} ${
                tab.isDisabled ? 'disabled' : ''
              }`}
              onClick={() => {
                handleTabClick(tab.id)
              }}
              disabled={tab.isDisabled}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                backgroundColor: currentTab === tab.id ? '#f0f0f0' : 'white',
                cursor: tab.isDisabled ? 'not-allowed' : 'pointer',
                opacity: tab.isDisabled ? 0.5 : 1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="plain-tab-content" style={{ padding: '16px', border: '1px solid #ccc' }}>
          {selectedTabContent}
        </div>
      </div>
    )
  },

  Dialog: ({
    isOpen = false,
    onClose,
    onPrimaryActionClick,
    isDestructive = false,
    primaryActionLabel,
    closeActionLabel,
    title,
    children,
    shouldCloseOnBackdropClick = false,
  }: DialogProps) => {
    const dialogRef = React.useRef<HTMLDialogElement>(null)

    React.useEffect(() => {
      const dialog = dialogRef.current
      if (!dialog) return

      if (isOpen && !dialog.open) {
        dialog.showModal()
      } else if (!isOpen && dialog.open) {
        dialog.close()
      }
    }, [isOpen])

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && shouldCloseOnBackdropClick) {
        onClose?.()
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    const handleClose = () => {
      onClose?.()
    }

    const handlePrimaryAction = () => {
      onPrimaryActionClick?.()
    }

    return (
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        style={{
          padding: '0',
          border: 'none',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90vw',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <div
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          role="presentation"
          style={{
            position: 'fixed',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              maxWidth: '500px',
              width: '90vw',
            }}
          >
            {title && (
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                }}
              >
                {title}
              </div>
            )}
            {children && (
              <div
                style={{
                  marginBottom: '24px',
                  lineHeight: '1.5',
                }}
              >
                {children}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                {closeActionLabel}
              </button>
              <button
                onClick={handlePrimaryAction}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: isDestructive ? '#dc2626' : '#2563eb',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {primaryActionLabel}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    )
  },
}
