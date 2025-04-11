import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { RadioGroupField } from './RadioGroupField'

export default {
  title: 'UI/Form/Fields/RadioGroup',
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
    <RadioGroupField name="categories" label="Categories" options={categories} />
    <RadioGroupField name="features" label="Features" options={features} />
    <RadioGroupField name="notifications" label="Notifications" options={notifications} />
  </FormWrapper>
)

export const Required: Story = () => (
  <FormWrapper>
    <RadioGroupField
      name="categories"
      label="Categories"
      options={categories}
      isRequired
      errorMessage="Please select a category"
    />
    <RadioGroupField
      name="features"
      label="Features"
      options={features}
      isRequired
      errorMessage="Please select a feature"
    />
    <RadioGroupField
      name="notifications"
      label="Notifications"
      options={notifications}
      isRequired
      errorMessage="Please select a notification type"
    />
    <button type="submit">Submit</button>
  </FormWrapper>
)

export const WithDefaultValues: Story = () => (
  <FormWrapper
    defaultValues={{
      categories: 'electronics',
      features: 'feature2',
      notifications: 'push',
    }}
  >
    <RadioGroupField name="categories" label="Categories" options={categories} />
    <RadioGroupField name="features" label="Features" options={features} />
    <RadioGroupField name="notifications" label="Notifications" options={notifications} />
  </FormWrapper>
)
