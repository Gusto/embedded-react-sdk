import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { SelectField } from './SelectField'

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

export const Required: Story = () => (
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

export const WithDescription: Story = () => (
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
