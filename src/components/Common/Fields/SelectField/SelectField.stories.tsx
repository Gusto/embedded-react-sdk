import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { SelectField } from './SelectField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/Select', // Updated to be under UI/Form instead of top-level Form
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

// We're temporarily skipping the generic type parameter to avoid TypeScript issues
export const Default: Story = () => (
  <FormWrapper>
    <SelectField
      name="category"
      label="Category"
      options={categories}
      placeholder="Select a category"
    />
    <SelectField
      name="priority"
      label="Priority"
      options={priorities}
      placeholder="Select a priority"
    />
    <SelectField name="status" label="Status" options={statuses} placeholder="Select a status" />
  </FormWrapper>
)

export const Required: Story = () => (
  <FormWrapper>
    <SelectField
      name="category"
      label="Category"
      options={categories}
      placeholder="Select a category"
      isRequired
      errorMessage="Category is required"
    />
    <SelectField
      name="priority"
      label="Priority"
      options={priorities}
      placeholder="Select a priority"
      isRequired
      errorMessage="Priority is required"
    />
    <SelectField
      name="status"
      label="Status"
      options={statuses}
      placeholder="Select a status"
      isRequired
      errorMessage="Status is required"
    />
  </FormWrapper>
)

export const WithDefaultValues: Story = () => (
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
      options={categories}
      placeholder="Select a category"
    />
    <SelectField
      name="priority"
      label="Priority"
      options={priorities}
      placeholder="Select a priority"
    />
    <SelectField name="status" label="Status" options={statuses} placeholder="Select a status" />
  </FormWrapper>
)

export const WithDescription: Story = () => (
  <FormWrapper>
    <SelectField
      name="category"
      label="Category"
      options={categories}
      placeholder="Select a category"
      description="Choose the product category"
    />
    <SelectField
      name="priority"
      label="Priority"
      options={priorities}
      placeholder="Select a priority"
      description="Set the task priority level"
    />
    <SelectField
      name="status"
      label="Status"
      options={statuses}
      placeholder="Select a status"
      description="Update the current status"
    />
  </FormWrapper>
)

export const WithCustomValue: Story = () => {
  const numericOptions = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' },
    { value: 4, label: 'Option 4' },
  ]

  const objectOptions = [
    { value: { id: 101, type: 'premium' }, label: 'Premium Plan' },
    { value: { id: 102, type: 'standard' }, label: 'Standard Plan' },
    { value: { id: 103, type: 'basic' }, label: 'Basic Plan' },
  ]

  const booleanOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ]

  const objectValueToString = (value: { id: number; type: string }) => `${value.id}-${value.type}`

  return (
    <FormWrapper
      defaultValues={{
        numericValue: 3,
        objectValue: { id: 101, type: 'premium' },
        booleanValue: true,
      }}
    >
      <SelectField<number>
        name="numericValue"
        label="Numeric Value"
        options={numericOptions}
        placeholder="Select a numeric value"
      />
      <SelectField<{ id: number; type: string }>
        name="objectValue"
        label="Object Value"
        options={objectOptions}
        placeholder="Select a plan"
        convertValueToString={objectValueToString}
      />
      <SelectField<boolean>
        name="booleanValue"
        label="Boolean Value"
        options={booleanOptions}
        placeholder="Select yes or no"
      />
    </FormWrapper>
  )
}
