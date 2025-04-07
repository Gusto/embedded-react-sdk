import type { Story } from '@ladle/react'
import { FieldErrorMessage } from './FieldErrorMessage'

export const Default: Story = () => (
  <FieldErrorMessage id="error-message">This is an error message</FieldErrorMessage>
)
