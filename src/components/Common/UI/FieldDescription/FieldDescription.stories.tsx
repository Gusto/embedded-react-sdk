import type { Story } from '@ladle/react'
import { FieldDescription } from './FieldDescription'

// Adding a meta object for title
export default {
  title: 'UI/Form/Layout/FieldDescription', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => (
  <FieldDescription>This is a simple description</FieldDescription>
)
