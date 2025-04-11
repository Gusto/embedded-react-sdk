import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { ComboBoxField } from './ComboBoxField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/ComboBox', // Updated to be under UI/Form instead of top-level Form
}

const categories = [
  { value: '1', label: 'Electronics', id: '1' },
  { value: '2', label: 'Clothing', id: '2' },
  { value: '3', label: 'Books', id: '3' },
  { value: '4', label: 'Home & Garden', id: '4' },
  { value: '5', label: 'Sports', id: '5' },
]

const priorities = [
  { value: 'low', label: 'Low', id: 'low' },
  { value: 'medium', label: 'Medium', id: 'medium' },
  { value: 'high', label: 'High', id: 'high' },
  { value: 'urgent', label: 'Urgent', id: 'urgent' },
]

const statuses = [
  { value: 'new', label: 'New', id: 'new' },
  { value: 'in-progress', label: 'In Progress', id: 'in-progress' },
  { value: 'review', label: 'Under Review', id: 'review' },
  { value: 'completed', label: 'Completed', id: 'completed' },
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
