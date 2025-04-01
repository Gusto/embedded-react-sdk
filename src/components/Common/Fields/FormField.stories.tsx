import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { FormField } from './FormField'

const FormWrapper = ({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode
  defaultValues?: Record<string, unknown>
}) => {
  const methods = useForm({
    defaultValues,
    mode: 'onTouched',
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

export const Default: Story = () => (
  <FormWrapper>
    <FormField label="Name" name="name">
      {(field, fieldState, { label }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="text" placeholder="Enter your name" />
        </div>
      )}
    </FormField>
  </FormWrapper>
)

export const WithDefaultValue: Story = () => (
  <FormWrapper defaultValues={{ name: 'John Doe' }}>
    <FormField label="Name" name="name">
      {(field, fieldState, { label }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="text" placeholder="Enter your name" />
        </div>
      )}
    </FormField>
  </FormWrapper>
)

export const WithValidation: Story = () => (
  <FormWrapper>
    <FormField
      label="Email"
      name="email"
      rules={{
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      }}
    >
      {(field, fieldState, { label, errorText }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="email" placeholder="Enter your email" />
          {fieldState.error && <p>{errorText ?? fieldState.error.message}</p>}
        </div>
      )}
    </FormField>
  </FormWrapper>
)

export const WithComplexValidation: Story = () => (
  <FormWrapper>
    <FormField
      label="Password"
      name="password"
      rules={{
        required: 'Password is required',
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters',
        },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        },
      }}
    >
      {(field, fieldState, { label, errorText }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="password" placeholder="Enter your password" />
          {fieldState.error && <p>{errorText ?? fieldState.error.message}</p>}
        </div>
      )}
    </FormField>
  </FormWrapper>
)

export const WithCustomError: Story = () => (
  <FormWrapper>
    <FormField
      label="Name"
      name="name"
      rules={{
        required: 'Name is required',
      }}
      errorText="Custom error message"
    >
      {(field, fieldState, { label, errorText }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="text" placeholder="Enter your name" />
          {fieldState.error && <p>{errorText}</p>}
        </div>
      )}
    </FormField>
  </FormWrapper>
)

export const WithDisabledState: Story = () => (
  <FormWrapper defaultValues={{ name: 'John Doe' }}>
    <FormField label="Name" name="name">
      {(field, fieldState, { label }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="text" placeholder="Enter your name" disabled />
        </div>
      )}
    </FormField>
  </FormWrapper>
)

export const WithCustomErrorHandling: Story = () => (
  <FormWrapper>
    <FormField
      label="Age"
      name="age"
      rules={{
        required: 'Age is required',
        min: {
          value: 18,
          message: 'You must be at least 18 years old',
        },
      }}
    >
      {(field, fieldState, { label, errorText }) => (
        <div>
          <label>{label}</label>
          <input {...field} type="number" placeholder="Enter your age" />
          {fieldState.error && (
            <div style={{ color: 'red', marginTop: '4px' }}>
              {fieldState.error.type === 'required'
                ? 'Please enter your age'
                : (errorText ?? fieldState.error.message)}
            </div>
          )}
        </div>
      )}
    </FormField>
  </FormWrapper>
)
