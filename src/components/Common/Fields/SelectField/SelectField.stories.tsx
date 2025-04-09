import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { action } from '@ladle/react'
import { SelectField } from './SelectField'

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

  // Log form state changes using Ladle action
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      action('Form State Changed')({
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
  { value: '1', label: 'Electronics' },
  { value: '2', label: 'Clothing' },
  { value: '3', label: 'Books' },
  { value: '4', label: 'Home & Garden' },
  { value: '5', label: 'Sports' },
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
]

export const Default: Story = () => {
  return (
    <FormWrapper>
      <SelectField
        name="category"
        label="Category"
        items={categories}
        placeholder="Select a category"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField name="status" label="Status" items={statuses} placeholder="Select a status">
        {item => <div>{item.label}</div>}
      </SelectField>
    </FormWrapper>
  )
}

export const Required: Story = () => {
  return (
    <FormWrapper>
      <SelectField
        name="category"
        label="Category"
        items={categories}
        placeholder="Select a category"
        isRequired
        errorMessage="Category is required"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
        isRequired
        errorMessage="Priority is required"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField
        name="status"
        label="Status"
        items={statuses}
        placeholder="Select a status"
        isRequired
        errorMessage="Status is required"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
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
      <SelectField
        name="category"
        label="Category"
        items={categories}
        placeholder="Select a category"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField name="status" label="Status" items={statuses} placeholder="Select a status">
        {item => <div>{item.label}</div>}
      </SelectField>
    </FormWrapper>
  )
}

export const WithDescription: Story = () => {
  return (
    <FormWrapper>
      <SelectField
        name="category"
        label="Category"
        items={categories}
        placeholder="Select a category"
        description="Choose the product category"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
        description="Set the task priority level"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
      <SelectField
        name="status"
        label="Status"
        items={statuses}
        placeholder="Select a status"
        description="Update the current status"
      >
        {item => <div>{item.label}</div>}
      </SelectField>
    </FormWrapper>
  )
}
