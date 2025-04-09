import type { Story } from '@ladle/react'
import { action } from '@ladle/react'
import { Select } from './Select'

const options = [
  { label: 'Option 1', value: '1o', id: '1o' },
  { label: 'Option 2', value: '2o', id: '2o' },
  { label: 'Option 3', value: '3o', id: '3o' },
  { label: 'Option 4', value: '4o', id: '4o' },
  { label: 'Option 5', value: '5o', id: '5o' },
]

// Handler for onChange events
const handleChange = (value: string) => {
  action('onChange')(value)
}

export const Default: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {}}
    />
  )
}

export const WithPlaceholder: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {}}
      placeholder="Choose an option"
    />
  )
}

export const WithDescription: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {}}
      description="Please select one of the available options"
    />
  )
}

export const WithError: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {}}
      isInvalid
      errorMessage="Please select a valid option"
    />
  )
}

export const Disabled: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {}}
      isDisabled
    />
  )
}

export const Required: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {}}
      isRequired={true}
    />
  )
}

export const WithOnBlur: Story = () => {
  return (
    <Select
      label="Select an option"
      name="select"
      options={options}
      onChange={handleChange}
      onBlur={() => {
        // eslint-disable-next-line no-console
        console.log('Select has been blurred')
      }}
    />
  )
}
