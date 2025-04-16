import type { Story } from '@ladle/react'
import { HorizontalFieldLayout } from './HorizontalFieldLayout'

// Adding a meta object for title
export default {
  title: 'UI/Form/Layout/HorizontalFieldLayout', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => (
  <HorizontalFieldLayout
    htmlFor="signatory"
    label="I confirm that I am the signatory"
    errorMessageId="signatory-error"
    descriptionId="signatory-description"
  >
    <input type="checkbox" id="signatory" aria-describedby="signatory-error" />
  </HorizontalFieldLayout>
)

export const WithDescription: Story = () => (
  <HorizontalFieldLayout
    htmlFor="signatory"
    label="I confirm that I am the signatory"
    errorMessageId="signatory-error"
    descriptionId="signatory-description"
    description="A signatory is a person who has the authority to sign documents on behalf of a company."
  >
    <input type="checkbox" id="signatory" aria-describedby="signatory-error" />
  </HorizontalFieldLayout>
)

export const WithError: Story = () => (
  <HorizontalFieldLayout
    htmlFor="signatory"
    label="I confirm that I am the signatory"
    descriptionId="signatory-description"
    errorMessage="This is an error message"
    errorMessageId="signatory-error"
    description="A signatory is a person who has the authority to sign documents on behalf of a company."
  >
    <input type="checkbox" id="signatory" aria-describedby="signatory-error" />
  </HorizontalFieldLayout>
)

export const WithVisuallyHiddenLabel: Story = () => (
  <HorizontalFieldLayout
    htmlFor="signatory"
    label="I confirm that I am the signatory"
    descriptionId="signatory-description"
    errorMessageId="signatory-error"
    shouldVisuallyHideLabel
  >
    <input type="checkbox" id="signatory" aria-describedby="signatory-error" />
  </HorizontalFieldLayout>
)
