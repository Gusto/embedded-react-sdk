import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { DatePicker } from './DatePicker'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/DatePicker', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => {
  const { value, handleSelectChange } = useLadleState<Date | null>('DatePicker onChange', undefined)

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
    />
  )
}

export const WithDescription: Story = () => {
  const { value, handleSelectChange } = useLadleState<Date | null>('DatePicker onChange', undefined)

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
      description="Please select a date for your appointment"
    />
  )
}

export const WithError: Story = () => {
  const { value, handleSelectChange } = useLadleState<Date | null>('DatePicker onChange', undefined)

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
      isInvalid
      errorMessage="Please select a valid date"
    />
  )
}

export const Disabled: Story = () => {
  const { value, handleSelectChange } = useLadleState<Date | null>('DatePicker onChange', undefined)

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
      isDisabled
    />
  )
}

export const Required: Story = () => {
  const { value, handleSelectChange } = useLadleState<Date | null>('DatePicker onChange', undefined)

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
      isRequired={true}
    />
  )
}

export const WithOnBlur: Story = () => {
  const { value, handleSelectChange, handleBlur } = useLadleState<Date | null>(
    'DatePicker onChange',
    undefined,
  )

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
      onBlur={handleBlur}
    />
  )
}

export const WithDefaultValue: Story = () => {
  // Using JavaScript's native Date
  const christmasDate = new Date(2023, 11, 25) // December 25, 2023
  const { value, handleSelectChange } = useLadleState<Date | null>(
    'DatePicker onChange',
    christmasDate,
  )

  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleSelectChange}
    />
  )
}
