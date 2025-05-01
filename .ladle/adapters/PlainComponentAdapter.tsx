import type React from 'react'
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
  ButtonIconProps,
  ButtonProps,
} from '../../src/components/Common/UI/Button/ButtonTypes'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import type { BreadcrumbsProps } from '@/components/Common/UI/Breadcrumb'
import type { TableProps } from '@/components/Common/UI/Table'

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
  Breadcrumbs: ({ crumbs }: BreadcrumbsProps) => {
    return (
      <nav className="breadcrumbs">
        <ol>
          {crumbs.map((crumb, index) => (
            <li key={index} className={crumb.isCurrent ? 'current' : ''}>
              {crumb.href ? (
                <a href={crumb.href} onClick={crumb.onClick}>
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {index < crumbs.length - 1 && <span className="separator"> /</span>}
            </li>
          ))}
        </ol>
      </nav>
    )
  },
  Button: ({
    isError = false,
    isLoading = false,
    isDisabled = false,
    ref,
    onClick,
    children,
    ...props
  }: ButtonProps) => {
    // Implement a simple button without the complex event translations
    return (
      <button
        ref={ref}
        disabled={isDisabled || isLoading}
        onClick={onClick}
        className={`button button-primary ${isError ? 'button-error' : ''} ${isLoading ? 'button-loading' : ''}`}
        {...props}
      >
        {isLoading ? <span className="button-loading-indicator">{children}</span> : children}
      </button>
    )
  },

  ButtonIcon: ({
    isError = false,
    isLoading = false,
    isDisabled = false,
    ref,
    onClick,
    children,
    ...props
  }: ButtonIconProps) => {
    return (
      <button
        ref={ref}
        disabled={isDisabled || isLoading}
        onClick={onClick}
        className={`button button-icon ${isError ? 'button-error' : ''} ${isLoading ? 'button-loading' : ''}`}
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

  Table: <T,>({
    data,
    columns,
    className,
    'aria-label': ariaLabel,
    emptyState,
    onSelect,
    itemMenu,
    ...props
  }: TableProps<T>) => {
    return (
      <table className={className} aria-label={ariaLabel} {...props}>
        <thead>
          <tr>
            {onSelect && (
              <th>
                <span className="visually-hidden">Select Row</span>
              </th>
            )}
            {columns.map((column, index) => (
              <th key={index} scope={column.isRowHeader ? 'row' : 'col'}>
                {column.title}
              </th>
            ))}
            {itemMenu && (
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && emptyState ? (
            <tr>
              <td colSpan={columns.length + (onSelect ? 1 : 0) + (itemMenu ? 1 : 0)}>
                {emptyState()}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {onSelect && (
                  <td>
                    <input
                      type="checkbox"
                      onChange={e => {
                        onSelect(item, e.target.checked)
                      }}
                      aria-label="Select Row"
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '')}
                  </td>
                ))}
                {itemMenu && <td>{itemMenu(item)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  },
}
