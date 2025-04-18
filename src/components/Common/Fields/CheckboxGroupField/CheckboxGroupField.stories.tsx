import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { CheckboxGroupField } from './CheckboxGroupField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/CheckboxGroup', // Updated to be under UI/Form instead of top-level Form
}

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
]

const features = [
  { value: 'feature1', label: 'Feature 1' },
  { value: 'feature2', label: 'Feature 2' },
  { value: 'feature3', label: 'Feature 3' },
  { value: 'feature4', label: 'Feature 4' },
]

const notifications = [
  { value: 'email', label: 'Email Notifications' },
  { value: 'sms', label: 'SMS Notifications' },
  { value: 'push', label: 'Push Notifications' },
  { value: 'in-app', label: 'In-App Notifications' },
]

export const Default: Story = () => (
  <FormWrapper>
    <CheckboxGroupField name="categories" label="Categories" options={categories} />
    <CheckboxGroupField name="features" label="Features" options={features} />
    <CheckboxGroupField name="notifications" label="Notifications" options={notifications} />
  </FormWrapper>
)

export const Required: Story = () => (
  <FormWrapper>
    <CheckboxGroupField
      name="categories"
      label="Categories"
      options={categories}
      isRequired
      errorMessage="At least one category is required"
    />
    <CheckboxGroupField
      name="features"
      label="Features"
      options={features}
      isRequired
      errorMessage="At least one feature is required"
    />
    <CheckboxGroupField
      name="notifications"
      label="Notifications"
      options={notifications}
      isRequired
      errorMessage="At least one notification type is required"
    />
    <button type="submit">Submit</button>
  </FormWrapper>
)

export const WithDefaultValues: Story = () => (
  <FormWrapper
    defaultValues={{
      categories: ['electronics', 'books'],
      features: ['feature1', 'feature3'],
      notifications: ['email', 'push'],
    }}
  >
    <CheckboxGroupField name="categories" label="Categories" options={categories} />
    <CheckboxGroupField name="features" label="Features" options={features} />
    <CheckboxGroupField name="notifications" label="Notifications" options={notifications} />
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
    <FormWrapper>
      <CheckboxGroupField<number>
        name="numericValues"
        label="Numeric Values"
        options={numericOptions}
      />
      <CheckboxGroupField<{ id: number; type: string }>
        name="objectValues"
        label="Object Values"
        options={objectOptions}
        convertValueToString={objectValueToString}
      />
      <CheckboxGroupField<boolean>
        name="booleanValues"
        label="Boolean Values"
        options={booleanOptions}
      />
    </FormWrapper>
  )
}
