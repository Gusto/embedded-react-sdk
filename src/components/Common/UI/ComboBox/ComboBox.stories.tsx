import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { ComboBox } from './ComboBox'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/ComboBox', // Updated to be under UI/Form instead of top-level Form
}

const usStates = [
  { label: 'Alabama', value: 'AL', id: 'AL' },
  { label: 'Alaska', value: 'AK', id: 'AK' },
  { label: 'Arizona', value: 'AZ', id: 'AZ' },
  { label: 'Arkansas', value: 'AR', id: 'AR' },
  { label: 'California', value: 'CA', id: 'CA' },
  { label: 'Colorado', value: 'CO', id: 'CO' },
  { label: 'Connecticut', value: 'CT', id: 'CT' },
  { label: 'Delaware', value: 'DE', id: 'DE' },
  { label: 'Florida', value: 'FL', id: 'FL' },
  { label: 'Georgia', value: 'GA', id: 'GA' },
  { label: 'Hawaii', value: 'HI', id: 'HI' },
  { label: 'Idaho', value: 'ID', id: 'ID' },
  { label: 'Illinois', value: 'IL', id: 'IL' },
  { label: 'Indiana', value: 'IN', id: 'IN' },
  { label: 'Iowa', value: 'IA', id: 'IA' },
  { label: 'Kansas', value: 'KS', id: 'KS' },
  { label: 'Kentucky', value: 'KY', id: 'KY' },
  { label: 'Louisiana', value: 'LA', id: 'LA' },
  { label: 'Maine', value: 'ME', id: 'ME' },
  { label: 'Maryland', value: 'MD', id: 'MD' },
  { label: 'Massachusetts', value: 'MA', id: 'MA' },
  { label: 'Michigan', value: 'MI', id: 'MI' },
  { label: 'Minnesota', value: 'MN', id: 'MN' },
  { label: 'Mississippi', value: 'MS', id: 'MS' },
  { label: 'Missouri', value: 'MO', id: 'MO' },
  { label: 'Montana', value: 'MT', id: 'MT' },
  { label: 'Nebraska', value: 'NE', id: 'NE' },
  { label: 'Nevada', value: 'NV', id: 'NV' },
  { label: 'New Hampshire', value: 'NH', id: 'NH' },
  { label: 'New Jersey', value: 'NJ', id: 'NJ' },
  { label: 'New Mexico', value: 'NM', id: 'NM' },
  { label: 'New York', value: 'NY', id: 'NY' },
  { label: 'North Carolina', value: 'NC', id: 'NC' },
  { label: 'North Dakota', value: 'ND', id: 'ND' },
  { label: 'Ohio', value: 'OH', id: 'OH' },
  { label: 'Oklahoma', value: 'OK', id: 'OK' },
  { label: 'Oregon', value: 'OR', id: 'OR' },
  { label: 'Pennsylvania', value: 'PA', id: 'PA' },
  { label: 'Rhode Island', value: 'RI', id: 'RI' },
  { label: 'South Carolina', value: 'SC', id: 'SC' },
  { label: 'South Dakota', value: 'SD', id: 'SD' },
  { label: 'Tennessee', value: 'TN', id: 'TN' },
  { label: 'Texas', value: 'TX', id: 'TX' },
  { label: 'Utah', value: 'UT', id: 'UT' },
  { label: 'Vermont', value: 'VT', id: 'VT' },
  { label: 'Virginia', value: 'VA', id: 'VA' },
  { label: 'Washington', value: 'WA', id: 'WA' },
  { label: 'West Virginia', value: 'WV', id: 'WV' },
  { label: 'Wisconsin', value: 'WI', id: 'WI' },
  { label: 'Wyoming', value: 'WY', id: 'WY' },
]

export const Default: Story = () => {
  const { value, handleChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      value={value}
    />
  )
}

export const WithPlaceholder: Story = () => {
  const { value, handleChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      placeholder="Search or select an option"
      value={value}
    />
  )
}

export const WithDescription: Story = () => {
  const { value, handleChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      description="Please search or select one of the available options"
      value={value}
    />
  )
}

export const WithError: Story = () => {
  const { value, handleChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      isInvalid
      errorMessage="Please select a valid option"
      value={value}
    />
  )
}

export const Disabled: Story = () => {
  const { value, handleChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      isDisabled
      value={value}
    />
  )
}

export const Required: Story = () => {
  const { handleChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      isRequired={true}
    />
  )
}

export const WithOnBlur: Story = () => {
  const { value, handleChange, handleBlur } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleChange}
      onBlur={handleBlur}
      value={value}
    />
  )
}

const enormousList = Array.from({ length: 50000 }, (_, i) => ({
  label: String(i),
  value: String(i),
}))

export const WithEnormousList: Story = () => {
  return <ComboBox label="Select an option" options={enormousList} />
}
