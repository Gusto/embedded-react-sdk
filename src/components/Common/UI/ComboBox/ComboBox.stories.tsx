import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { ComboBox } from './ComboBox'
// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/ComboBox', // Updated to be under UI/Form instead of top-level Form
}
const usStates = [
  { label: 'Alabama', value: 'AL', textValue: 'Alabama' },
  { label: 'Alaska', value: 'AK', textValue: 'Alaska' },
  { label: 'Arizona', value: 'AZ', textValue: 'Arizona' },
  { label: 'Arkansas', value: 'AR', textValue: 'Arkansas' },
  { label: 'California', value: 'CA', textValue: 'California' },
  { label: 'Colorado', value: 'CO', textValue: 'Colorado' },
  { label: 'Connecticut', value: 'CT', textValue: 'Connecticut' },
  { label: 'Delaware', value: 'DE', textValue: 'Delaware' },
  { label: 'Florida', value: 'FL', textValue: 'Florida' },
  { label: 'Georgia', value: 'GA', textValue: 'Georgia' },
  { label: 'Hawaii', value: 'HI', textValue: 'Hawaii' },
  { label: 'Idaho', value: 'ID', textValue: 'Idaho' },
  { label: 'Illinois', value: 'IL', textValue: 'Illinois' },
  { label: 'Indiana', value: 'IN', textValue: 'Indiana' },
  { label: 'Iowa', value: 'IA', textValue: 'Iowa' },
  { label: 'Kansas', value: 'KS', textValue: 'Kansas' },
  { label: 'Kentucky', value: 'KY', textValue: 'Kentucky' },
  { label: 'Louisiana', value: 'LA', textValue: 'Louisiana' },
  { label: 'Maine', value: 'ME', textValue: 'Maine' },
  { label: 'Maryland', value: 'MD', textValue: 'Maryland' },
  { label: 'Massachusetts', value: 'MA', textValue: 'Massachusetts' },
  { label: 'Michigan', value: 'MI', textValue: 'Michigan' },
  { label: 'Minnesota', value: 'MN', textValue: 'Minnesota' },
  { label: 'Mississippi', value: 'MS', textValue: 'Mississippi' },
  { label: 'Missouri', value: 'MO', textValue: 'Missouri' },
  { label: 'Montana', value: 'MT', textValue: 'Montana' },
  { label: 'Nebraska', value: 'NE', textValue: 'Nebraska' },
  { label: 'Nevada', value: 'NV', textValue: 'Nevada' },
  { label: 'New Hampshire', value: 'NH', textValue: 'New Hampshire' },
  { label: 'New Jersey', value: 'NJ', textValue: 'New Jersey' },
  { label: 'New Mexico', value: 'NM', textValue: 'New Mexico' },
  { label: 'New York', value: 'NY', textValue: 'New York' },
  { label: 'North Carolina', value: 'NC', textValue: 'North Carolina' },
  { label: 'North Dakota', value: 'ND', textValue: 'North Dakota' },
  { label: 'Ohio', value: 'OH', textValue: 'Ohio' },
  { label: 'Oklahoma', value: 'OK', textValue: 'Oklahoma' },
  { label: 'Oregon', value: 'OR', textValue: 'Oregon' },
  { label: 'Pennsylvania', value: 'PA', textValue: 'Pennsylvania' },
  { label: 'Rhode Island', value: 'RI', textValue: 'Rhode Island' },
  { label: 'South Carolina', value: 'SC', textValue: 'South Carolina' },
  { label: 'South Dakota', value: 'SD', textValue: 'South Dakota' },
  { label: 'Tennessee', value: 'TN', textValue: 'Tennessee' },
  { label: 'Texas', value: 'TX', textValue: 'Texas' },
  { label: 'Utah', value: 'UT', textValue: 'Utah' },
  { label: 'Vermont', value: 'VT', textValue: 'Vermont' },
  { label: 'Virginia', value: 'VA', textValue: 'Virginia' },
  { label: 'Washington', value: 'WA', textValue: 'Washington' },
  { label: 'West Virginia', value: 'WV', textValue: 'West Virginia' },
  { label: 'Wisconsin', value: 'WI', textValue: 'Wisconsin' },
  { label: 'Wyoming', value: 'WY', textValue: 'Wyoming' },
]
export const Default = () => {
  const { value, handleChange } = useStoryState<string>('ComboBox onChange')
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
export const WithPlaceholder = () => {
  const { value, handleChange } = useStoryState<string>('ComboBox onChange')
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
export const WithDescription = () => {
  const { value, handleChange } = useStoryState<string>('ComboBox onChange')
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
export const WithError = () => {
  const { value, handleChange } = useStoryState<string>('ComboBox onChange')
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
export const Disabled = () => {
  const { value, handleChange } = useStoryState<string>('ComboBox onChange')
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
export const Required = () => {
  const { handleChange } = useStoryState<string>('ComboBox onChange')
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
export const WithOnBlur = () => {
  const { value, handleChange, handleBlur } = useStoryState<string>('ComboBox onChange')
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
  textValue: String(i),
}))
export const WithEnormousList = () => {
  return <ComboBox label="Select an option" options={enormousList} />
}
