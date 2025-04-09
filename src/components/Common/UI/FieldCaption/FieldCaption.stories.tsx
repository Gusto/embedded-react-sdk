import type { Story } from '@ladle/react'
import { FieldCaption } from './FieldCaption'

export const Default: Story = () => <FieldCaption htmlFor="input-field">Field Label</FieldCaption>

export const Required: Story = () => (
  <FieldCaption htmlFor="required-field" isRequired>
    Required Field
  </FieldCaption>
)
