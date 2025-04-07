import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { TextInputField } from './TextInputField'

interface FormWrapperProps {
  children: React.ReactNode
  defaultValues?: {
    firstName?: string
    lastName?: string
    favoriteFood?: string
    test?: number
  }
}

const FormWrapper = ({ children, defaultValues = {} }: FormWrapperProps) => {
  const methods = useForm({
    defaultValues: {
      firstName: defaultValues.firstName || '',
      lastName: defaultValues.lastName || '',
      favoriteFood: defaultValues.favoriteFood || '',
      test: defaultValues.test || 0,
    },
    mode: 'onTouched',
  })

  return (
    <FormProvider {...methods}>
      <div>{children}</div>
    </FormProvider>
  )
}

export const Default: Story = () => (
  <FormWrapper>
    <TextInputField label="First Name" name="firstName" />
    <TextInputField label="Last Name" name="lastName" />
    <TextInputField label="Favorite Food" name="favoriteFood" />
  </FormWrapper>
)

export const Required: Story = () => {
  return (
    <FormWrapper>
      <TextInputField
        label="First Name"
        name="firstName"
        isRequired
        errorMessage="First Name is required"
      />
      <TextInputField
        label="Last Name"
        name="lastName"
        isRequired
        errorMessage="Last Name is required"
      />
      <TextInputField
        label="Favorite Food"
        name="favoriteFood"
        isRequired
        errorMessage="Favorite Food is required"
      />
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <FormWrapper
      defaultValues={{
        firstName: 'Angela',
        lastName: 'Merkel',
        favoriteFood: 'Rissotto',
      }}
    >
      <TextInputField label="First Name" name="firstName" />
      <TextInputField label="Last Name" name="lastName" />
      <TextInputField label="Favorite Food" name="favoriteFood" />
    </FormWrapper>
  )
}
