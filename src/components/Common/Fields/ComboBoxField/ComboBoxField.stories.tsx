import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { action } from '@ladle/react'
import { ComboBoxField } from './ComboBoxField'

interface FormWrapperProps {
  children: React.ReactNode
  defaultValues?: {
    category?: string
    priority?: string
    status?: string
  }
}

const FormWrapper = ({ children, defaultValues = {} }: FormWrapperProps) => {
  const methods = useForm({
    defaultValues: {
      category: defaultValues.category || '',
      priority: defaultValues.priority || '',
      status: defaultValues.status || '',
    },
    mode: 'onTouched',
  })

  // Track form state changes with Ladle actions
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      action('Form state changed')({
        values: value,
        name,
        type,
        errors: methods.formState.errors,
        touchedFields: methods.formState.touchedFields,
        dirtyFields: methods.formState.dirtyFields,
        isDirty: methods.formState.isDirty,
        isValid: methods.formState.isValid,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [methods])

  return (
    <FormProvider {...methods}>
      <div>{children}</div>
    </FormProvider>
  )
}

const categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Books' },
  { id: '4', name: 'Home & Garden' },
  { id: '5', name: 'Sports' },
]

const priorities = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'urgent', name: 'Urgent' },
]

const statuses = [
  { id: 'new', name: 'New' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Under Review' },
  { id: 'completed', name: 'Completed' },
]

export const Default: Story = () => {
  return (
    <FormWrapper>
      <ComboBoxField
        name="category"
        label="Category"
        options={categories}
        placeholder="Search or select a category"
      />
      <ComboBoxField
        name="priority"
        label="Priority"
        options={priorities}
        placeholder="Search or select a priority"
      />
      <ComboBoxField
        name="status"
        label="Status"
        options={statuses}
        placeholder="Search or select a status"
      />
    </FormWrapper>
  )
}

export const Required: Story = () => {
  return (
    <FormWrapper>
      <ComboBoxField
        name="category"
        label="Category"
        options={categories}
        placeholder="Search or select a category"
        isRequired
        errorMessage="Category is required"
      />
      <ComboBoxField
        name="priority"
        label="Priority"
        options={priorities}
        placeholder="Search or select a priority"
        isRequired
        errorMessage="Priority is required"
      />
      <ComboBoxField
        name="status"
        label="Status"
        options={statuses}
        placeholder="Search or select a status"
        isRequired
        errorMessage="Status is required"
      />
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <FormWrapper
      defaultValues={{
        category: '3',
        priority: 'high',
        status: 'review',
      }}
    >
      <ComboBoxField
        name="category"
        label="Category"
        options={categories}
        placeholder="Search or select a category"
      />
      <ComboBoxField
        name="priority"
        label="Priority"
        options={priorities}
        placeholder="Search or select a priority"
      />
      <ComboBoxField
        name="status"
        label="Status"
        options={statuses}
        placeholder="Search or select a status"
      />
    </FormWrapper>
  )
}

export const WithDescription: Story = () => {
  return (
    <FormWrapper>
      <ComboBoxField
        name="category"
        label="Category"
        options={categories}
        placeholder="Search or select a category"
        description="Choose the product category"
      />
      <ComboBoxField
        name="priority"
        label="Priority"
        options={priorities}
        placeholder="Search or select a priority"
        description="Set the task priority level"
      />
      <ComboBoxField
        name="status"
        label="Status"
        options={statuses}
        placeholder="Search or select a status"
        description="Update the current status"
      />
    </FormWrapper>
  )
}
