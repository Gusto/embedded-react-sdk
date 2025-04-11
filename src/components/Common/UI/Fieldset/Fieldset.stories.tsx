import type { Story } from '@ladle/react'
import { Fieldset } from './Fieldset'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Fieldset', // Updated to be under UI/Form instead of top-level Form
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--g-spacing-4)' }}>
    {children}
  </div>
)

export const Default: Story = () => (
  <Fieldset legend="Contact Information">
    <Layout>
      <label htmlFor="firstName">
        First Name
        <input id="firstName" type="text" placeholder="Enter your first name" />
      </label>
      <label htmlFor="lastName">
        Last Name
        <input id="lastName" type="text" placeholder="Enter your last name" />
      </label>
      <label htmlFor="email">
        Email
        <input id="email" type="email" placeholder="Enter your email" />
      </label>
    </Layout>
  </Fieldset>
)

export const WithDescription: Story = () => (
  <Fieldset
    legend="Account Settings"
    description="Configure your account preferences and notification settings"
  >
    <Layout>
      <label htmlFor="notifications">
        Enable notifications
        <input type="checkbox" id="notifications" />
      </label>
      <label htmlFor="newsletter">
        Subscribe to newsletter
        <input type="checkbox" id="newsletter" />
      </label>
    </Layout>
  </Fieldset>
)

export const WithError: Story = () => (
  <Fieldset legend="Payment Information" errorMessage="Please provide valid payment details">
    <Layout>
      <label htmlFor="cardNumber">
        Card Number
        <input id="cardNumber" type="text" placeholder="Enter card number" />
      </label>
      <label htmlFor="expiryDate">
        Expiry Date
        <input id="expiryDate" type="text" placeholder="MM/YY" />
      </label>
      <label htmlFor="cvv">
        CVV
        <input id="cvv" type="text" placeholder="Enter CVV" />
      </label>
    </Layout>
  </Fieldset>
)
