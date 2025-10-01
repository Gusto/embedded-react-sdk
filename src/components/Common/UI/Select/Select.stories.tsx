import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { Select } from './Select'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Select', // Updated to be under UI/Form instead of top-level Form
}

const options = [
  { label: 'Option 1', value: '1o', id: '1o' },
  { label: 'Option 2', value: '2o', id: '2o' },
  { label: 'Option 3', value: '3o', id: '3o' },
  { label: 'Option 4', value: '4o', id: '4o' },
  { label: 'Option 5', value: '5o', id: '5o' },
]

export const Default: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
    />
  )
}

export const WithPlaceholder: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
      placeholder="Choose an option"
    />
  )
}

export const WithDescription: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
      description="Please select one of the available options"
    />
  )
}

export const WithError: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
      isInvalid
      errorMessage="Please select a valid option"
    />
  )
}

export const Disabled: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
      isDisabled
    />
  )
}

export const Required: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
      isRequired
    />
  )
}

export const WithOnBlur: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('SelectChange')
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      value={value}
      onBlur={handleBlur}
    />
  )
}
