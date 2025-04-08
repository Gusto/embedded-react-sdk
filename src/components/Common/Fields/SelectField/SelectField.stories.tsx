import type { Story } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
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

  // Log form state changes to console
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      // eslint-disable-next-line no-console
      console.log('Form state changed:', {
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
      <SelectField
        name="category"
        label="Category"
        items={categories}
        placeholder="Select a category"
      >
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
      >
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField name="status" label="Status" items={statuses} placeholder="Select a status">
        {item => <div>{item.name}</div>}
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
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
        isRequired
        errorMessage="Priority is required"
      >
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField
        name="status"
        label="Status"
        items={statuses}
        placeholder="Select a status"
        isRequired
        errorMessage="Status is required"
      >
        {item => <div>{item.name}</div>}
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
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
      >
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField name="status" label="Status" items={statuses} placeholder="Select a status">
        {item => <div>{item.name}</div>}
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
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField
        name="priority"
        label="Priority"
        items={priorities}
        placeholder="Select a priority"
        description="Set the task priority level"
      >
        {item => <div>{item.name}</div>}
      </SelectField>
      <SelectField
        name="status"
        label="Status"
        items={statuses}
        placeholder="Select a status"
        description="Update the current status"
      >
        {item => <div>{item.name}</div>}
      </SelectField>
    </FormWrapper>
  )
}
