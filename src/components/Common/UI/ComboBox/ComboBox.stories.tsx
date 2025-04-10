import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { ComboBox } from './ComboBox'

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
  const { handleSelectChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
    />
  )
}

export const WithPlaceholder: Story = () => {
  const { handleSelectChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
      placeholder="Search or select an option"
    />
  )
}

export const WithDescription: Story = () => {
  const { handleSelectChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
      description="Please search or select one of the available options"
    />
  )
}

export const WithError: Story = () => {
  const { handleSelectChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
      isInvalid
      errorMessage="Please select a valid option"
    />
  )
}

export const Disabled: Story = () => {
  const { handleSelectChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
      isDisabled
    />
  )
}

export const Required: Story = () => {
  const { handleSelectChange } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
      isRequired={true}
    />
  )
}

export const WithOnBlur: Story = () => {
  const { handleSelectChange, handleBlur } = useLadleState<string>('ComboBox onChange')

  return (
    <ComboBox
      label="Select an option"
      name="combobox"
      options={usStates}
      onChange={handleSelectChange}
      onBlur={handleBlur}
    />
  )
}
