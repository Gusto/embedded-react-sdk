import type { Story } from '@ladle/react'
import { FieldLayout } from './FieldLayout'

// Adding a meta object for title
export default {
  title: 'UI/Form/Layout/FieldLayout', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => (
  <FieldLayout
    htmlFor="email"
    label="Email"
    errorMessageId="email-error"
    descriptionId="email-description"
  >
    <input id="email" type="text" placeholder="Enter your email" />
  </FieldLayout>
)

export const WithDescription: Story = () => (
  <FieldLayout
    htmlFor="email"
    label="Email"
    description="This is a description"
    errorMessageId="email-error"
    descriptionId="email-description"
  >
    <input id="email" type="text" placeholder="Enter your email" />
  </FieldLayout>
)

export const WithError: Story = () => (
  <FieldLayout
    htmlFor="email"
    label="Email"
    errorMessage="This is an error message"
    errorMessageId="email-error"
    descriptionId="email-description"
  >
    <input id="email" type="text" placeholder="Enter your email" />
  </FieldLayout>
)

export const WithRequired: Story = () => (
  <FieldLayout
    htmlFor="email"
    label="Email"
    isRequired
    errorMessageId="email-error"
    descriptionId="email-description"
  >
    <input id="email" type="text" placeholder="Enter your email" />
  </FieldLayout>
)
