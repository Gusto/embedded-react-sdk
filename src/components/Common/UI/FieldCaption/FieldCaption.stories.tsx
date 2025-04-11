import type { Story } from '@ladle/react'
import { FieldCaption } from './FieldCaption'

// Adding a meta object for title
export default {
  title: 'UI/Form/Layout/FieldCaption', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => <FieldCaption htmlFor="input-field">Field Label</FieldCaption>

export const Required: Story = () => (
  <FieldCaption htmlFor="required-field" isRequired>
    Required Field
  </FieldCaption>
)
