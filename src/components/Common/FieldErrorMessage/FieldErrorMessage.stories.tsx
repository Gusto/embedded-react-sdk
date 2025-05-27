import type { Story } from '@ladle/react'
import { FieldErrorMessage } from './FieldErrorMessage'

// Adding a meta object for title
export default {
  title: 'UI/Form/Layout/FieldErrorMessage', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => (
  <FieldErrorMessage id="error-message">This is an error message</FieldErrorMessage>
)
