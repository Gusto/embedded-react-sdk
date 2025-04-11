import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { DatePickerField } from './DatePickerField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/DatePickerField', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => {
  return (
    <FormWrapper>
      <DatePickerField name="birthDate" label="Birth Date" />
      <DatePickerField name="appointmentDate" label="Appointment Date" />
      <DatePickerField name="startDate" label="Start Date" />
    </FormWrapper>
  )
}

export const Required: Story = () => {
  return (
    <FormWrapper>
      <DatePickerField
        name="birthDate"
        label="Birth Date"
        isRequired
        errorMessage="Birth date is required"
      />
      <DatePickerField
        name="appointmentDate"
        label="Appointment Date"
        isRequired
        errorMessage="Appointment date is required"
      />
      <DatePickerField
        name="startDate"
        label="Start Date"
        isRequired
        errorMessage="Start date is required"
      />
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  // Use JavaScript's native Date objects for default values
  const birthDate = new Date(1990, 0, 1) // January 1, 1990
  const appointmentDate = new Date(2023, 11, 25) // December 25, 2023
  const startDate = new Date(2024, 0, 1) // January 1, 2024

  return (
    <FormWrapper
      defaultValues={{
        birthDate,
        appointmentDate,
        startDate,
      }}
    >
      <DatePickerField name="birthDate" label="Birth Date" />
      <DatePickerField name="appointmentDate" label="Appointment Date" />
      <DatePickerField name="startDate" label="Start Date" />
    </FormWrapper>
  )
}

export const WithDescription: Story = () => {
  return (
    <FormWrapper>
      <DatePickerField name="birthDate" label="Birth Date" description="Enter your date of birth" />
      <DatePickerField
        name="appointmentDate"
        label="Appointment Date"
        description="Choose your preferred appointment date"
      />
      <DatePickerField
        name="startDate"
        label="Start Date"
        description="Select when you would like to start"
      />
    </FormWrapper>
  )
}
