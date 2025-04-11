import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { ComboBoxField } from './ComboBoxField'

export default {
  title: 'UI/Form/Fields/ComboBox',
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
      <button type="submit">Submit</button>
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
