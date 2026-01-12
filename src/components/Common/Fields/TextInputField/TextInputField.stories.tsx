import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { TextInputField } from './TextInputField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/Text', // Updated to be under UI/Form instead of top-level Form
}

export const Default = () => (
  <FormWrapper>
    <TextInputField label="First Name" name="firstName" />
    <TextInputField label="Last Name" name="lastName" />
    <TextInputField label="Favorite Food" name="favoriteFood" />
  </FormWrapper>
)

export const Required = () => {
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

export const WithDefaultValues = () => {
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

export const NumberInputWithMinMax = () => {
  return (
    <FormWrapper>
      <TextInputField
        label="Age"
        name="age"
        type="number"
        min={0}
        max={120}
        description="Enter a value between 0 and 120"
      />
      <TextInputField
        label="Hours Worked"
        name="hoursWorked"
        type="number"
        min={0}
        description="Cannot be negative"
      />
      <TextInputField
        label="Score"
        name="score"
        type="number"
        min={0}
        max={100}
        description="Enter a score from 0 to 100"
      />
    </FormWrapper>
  )
}
