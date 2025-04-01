import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { TextField } from './TextField'

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      email: '',
      password: '',
      search: '',
    },
    mode: 'onTouched',
  })
  return (
    <FormProvider {...methods}>
      <div className="p-4 max-w-md">{children}</div>
    </FormProvider>
  )
}

export const Default: Story = () => (
  <FormWrapper>
    <TextField label="Email" name="email" type="email" />
  </FormWrapper>
)

export const WithDescription: Story = () => (
  <FormWrapper>
    <TextField
      label="Password"
      name="password"
      type="password"
      description="Must be at least 8 characters long"
    />
  </FormWrapper>
)

export const WithError: Story = () => {
  const methods = useForm({
    defaultValues: {
      search: '',
    },
    mode: 'onTouched',
  })
  // Trigger error state
  void methods.trigger('search')

  return (
    <FormProvider {...methods}>
      <div className="p-4 max-w-md">
        <TextField
          label="Search"
          name="search"
          type="search"
          rules={{
            required: 'Search is required',
          }}
        />
      </div>
    </FormProvider>
  )
}

export const Required: Story = () => (
  <FormWrapper>
    <TextField label="Email" name="email" type="email" isRequired />
  </FormWrapper>
)

export const WithPlaceholder: Story = () => (
  <FormWrapper>
    <TextField label="Search" name="search" type="search" placeholder="Enter search term..." />
  </FormWrapper>
)
