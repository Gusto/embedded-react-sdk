import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { CheckboxField } from './CheckboxField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/Checkbox', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => (
  <FormWrapper>
    <CheckboxField label="Accept Terms and Conditions" name="acceptTerms" />
  </FormWrapper>
)

export const Required: Story = () => {
  return (
    <FormWrapper>
      <CheckboxField
        label="Accept Terms and Conditions"
        name="acceptTerms"
        isRequired
        errorMessage="You must accept the terms"
      />
      <br />
      <button type="submit">Submit</button>
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <FormWrapper
      defaultValues={{
        acceptTerms: true,
        subscribeNewsletter: false,
        enableNotifications: true,
      }}
    >
      <CheckboxField label="Accept Terms and Conditions" name="acceptTerms" />
      <CheckboxField label="Subscribe to Newsletter" name="subscribeNewsletter" />
      <CheckboxField label="Enable Push Notifications" name="enableNotifications" />
    </FormWrapper>
  )
}
