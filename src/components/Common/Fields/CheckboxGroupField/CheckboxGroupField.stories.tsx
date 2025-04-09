import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { CheckboxGroupField } from './CheckboxGroupField'

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
