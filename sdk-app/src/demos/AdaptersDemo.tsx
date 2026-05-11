import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import type { ButtonProps, TextInputProps } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID } from './config'

function MyButton({
  children,
  variant = 'primary',
  isDisabled,
  isLoading,
  onClick,
  type,
  name,
  id,
}: ButtonProps) {
  const isPrimary = variant === 'primary'
  const isError = variant === 'error'

  return (
    <button
      id={id}
      name={name}
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: isError ? '#d92d20' : isPrimary ? '#111' : '#ccc',
        background: isError ? '#d92d20' : isPrimary ? '#111' : '#fff',
        color: isPrimary || isError ? '#fff' : '#1c1c1c',
        cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  )
}

function MyTextInput({
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
}: TextInputProps) {
  const inputId = id || name

  return (
    <label htmlFor={inputId} style={{ display: 'block', marginBottom: '16px' }}>
      <span style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
        {label}
        {isRequired ? ' *' : null}
      </span>
      {description && !isInvalid ? (
        <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          {description}
        </span>
      ) : null}
      <input
        id={inputId}
        name={name}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={isDisabled}
        onChange={e => onChange?.(e.target.value)}
        onBlur={() => onBlur?.()}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '4px',
          border: `1px solid ${isInvalid ? '#d92d20' : '#ccc'}`,
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
      />
      {isInvalid && errorMessage ? (
        <span style={{ display: 'block', fontSize: '12px', color: '#d92d20', marginTop: '4px' }}>
          {errorMessage}
        </span>
      ) : null}
    </label>
  )
}

export default function AdaptersDemo() {
  return (
    <GustoProvider
      config={{ baseUrl: BASE_URL }}
      components={{
        Button: MyButton,
        TextInput: MyTextInput,
      }}
    >
      <Employee.OnboardingFlow
        companyId={COMPANY_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
