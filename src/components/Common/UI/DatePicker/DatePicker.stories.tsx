import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { DatePicker } from './DatePicker'
// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/DatePicker', // Updated to be under UI/Form instead of top-level Form
}
export const Default = () => {
  const { value, handleChange } = useStoryState<Date | null>('DatePicker onChange', undefined)
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
    />
  )
}
export const WithDescription = () => {
  const { value, handleChange } = useStoryState<Date | null>('DatePicker onChange', undefined)
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
      description="Please select a date for your appointment"
    />
  )
}
export const WithError = () => {
  const { value, handleChange } = useStoryState<Date | null>('DatePicker onChange', undefined)
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
      isInvalid
      errorMessage="Please select a valid date"
    />
  )
}
export const Disabled = () => {
  const { value, handleChange } = useStoryState<Date | null>('DatePicker onChange', undefined)
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
      isDisabled
    />
  )
}
export const Required = () => {
  const { value, handleChange } = useStoryState<Date | null>('DatePicker onChange', undefined)
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
      isRequired={true}
    />
  )
}
export const WithOnBlur = () => {
  const { value, handleChange, handleBlur } = useStoryState<Date | null>(
    'DatePicker onChange',
    undefined,
  )
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
export const WithDefaultValue = () => {
  // Using JavaScript's native Date
  const christmasDate = new Date(2023, 11, 25) // December 25, 2023
  const { value, handleChange } = useStoryState<Date | null>('DatePicker onChange', christmasDate)
  return (
    <DatePicker
      label="Select a date"
      name="datepicker"
      value={value || undefined}
      onChange={handleChange}
    />
  )
}
