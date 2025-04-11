import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { TextInputField } from './TextInputField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/Text', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => (
  <FormWrapper>
    <TextInputField label="First Name" name="firstName" />
    <TextInputField label="Last Name" name="lastName" />
    <TextInputField label="Favorite Food" name="favoriteFood" />
  </FormWrapper>
)

export const Required: Story = () => {
  return (
    <FormWrapper>
      <TextInputField
        label="First Name"
        name="firstName"
        isRequired
        errorMessage="First Name is required"
      />
      <TextInputField
        label="Last Name"
        name="lastName"
        isRequired
        errorMessage="Last Name is required"
      />
      <TextInputField
        label="Favorite Food"
        name="favoriteFood"
        isRequired
        errorMessage="Favorite Food is required"
      />
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <FormWrapper
      defaultValues={{
        firstName: 'Angela',
        lastName: 'Merkel',
        favoriteFood: 'Rissotto',
      }}
    >
      <TextInputField label="First Name" name="firstName" />
      <TextInputField label="Last Name" name="lastName" />
      <TextInputField label="Favorite Food" name="favoriteFood" />
    </FormWrapper>
  )
}
