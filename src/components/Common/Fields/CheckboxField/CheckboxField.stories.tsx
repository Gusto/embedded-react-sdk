import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { CheckboxField } from './CheckboxField'

interface FormWrapperProps {
  children: React.ReactNode
  defaultValues?: {
    acceptTerms?: boolean
    subscribeNewsletter?: boolean
    enableNotifications?: boolean
  }
}

const FormWrapper = ({ children, defaultValues = {} }: FormWrapperProps) => {
  const methods = useForm({
    defaultValues: {
      acceptTerms: defaultValues.acceptTerms ?? false,
      subscribeNewsletter: defaultValues.subscribeNewsletter ?? false,
      enableNotifications: defaultValues.enableNotifications ?? false,
    },
    mode: 'onTouched',
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>{children}</form>
    </FormProvider>
  )
}

export const Default: Story = () => (
  <FormWrapper>
    <CheckboxField label="Accept Terms and Conditions" name="acceptTerms" />
  </FormWrapper>
)

export const Required: Story = () => {
  return (
    <FormWrapper>
      <CheckboxField
        label="Accept Terms and Conditions"
        name="acceptTerms"
        isRequired
        errorMessage="You must accept the terms"
      />
      <br />
      <button type="submit">Submit</button>
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <FormWrapper
      defaultValues={{
        acceptTerms: true,
        subscribeNewsletter: false,
        enableNotifications: true,
      }}
    >
      <CheckboxField label="Accept Terms and Conditions" name="acceptTerms" />
      <CheckboxField label="Subscribe to Newsletter" name="subscribeNewsletter" />
      <CheckboxField label="Enable Push Notifications" name="enableNotifications" />
    </FormWrapper>
  )
}
