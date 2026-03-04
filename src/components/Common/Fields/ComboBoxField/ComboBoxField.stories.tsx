import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { ComboBoxField } from './ComboBoxField'

export default {
  title: 'UI/Form/Fields/ComboBox',
}

const categories = [
  { value: '1', label: 'Electronics', textValue: 'Electronics' },
  { value: '2', label: 'Clothing', textValue: 'Clothing' },
  { value: '3', label: 'Books', textValue: 'Books' },
  { value: '4', label: 'Home & Garden', textValue: 'Home & Garden' },
  { value: '5', label: 'Sports', textValue: 'Sports' },
]

const priorities = [
  { value: 'low', label: 'Low', textValue: 'Low' },
  { value: 'medium', label: 'Medium', textValue: 'Medium' },
  { value: 'high', label: 'High', textValue: 'High' },
  { value: 'urgent', label: 'Urgent', textValue: 'Urgent' },
]

const statuses = [
  { value: 'new', label: 'New', textValue: 'New' },
  { value: 'in-progress', label: 'In Progress', textValue: 'In Progress' },
  { value: 'review', label: 'Under Review', textValue: 'Under Review' },
  { value: 'completed', label: 'Completed', textValue: 'Completed' },
]

export const Default = () => {
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

export const Required = () => {
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

export const WithDefaultValues = () => {
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

export const WithDescription = () => {
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

export const WithCustomValue = () => {
  const numericOptions = [
    { value: 1, label: 'Option 1', textValue: 'Option 1' },
    { value: 2, label: 'Option 2', textValue: 'Option 2' },
    { value: 3, label: 'Option 3', textValue: 'Option 3' },
    { value: 4, label: 'Option 4', textValue: 'Option 4' },
  ]

  const objectOptions = [
    { value: { id: 101, type: 'premium' }, label: 'Premium Plan', textValue: 'Premium Plan' },
    { value: { id: 102, type: 'standard' }, label: 'Standard Plan', textValue: 'Standard Plan' },
    { value: { id: 103, type: 'basic' }, label: 'Basic Plan', textValue: 'Basic Plan' },
  ]

  const booleanOptions = [
    { value: true, label: 'Yes', textValue: 'Yes' },
    { value: false, label: 'No', textValue: 'No' },
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
      <ComboBoxField<number>
        name="numericValue"
        label="Numeric Value"
        options={numericOptions}
        placeholder="Select a numeric value"
      />
      <ComboBoxField<{ id: number; type: string }>
        name="objectValue"
        label="Object Value"
        options={objectOptions}
        placeholder="Select a plan"
        convertValueToString={objectValueToString}
      />
      <ComboBoxField<boolean>
        name="booleanValue"
        label="Boolean Value"
        options={booleanOptions}
        placeholder="Select yes or no"
      />
    </FormWrapper>
  )
}
