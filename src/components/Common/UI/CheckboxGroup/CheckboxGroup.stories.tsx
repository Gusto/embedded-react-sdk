import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { CheckboxGroup } from './CheckboxGroup'
export default {
  title: 'UI/Form/Inputs/CheckboxGroup',
}
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
]
function useCheckboxGroupState() {
  const { value, handleChange } = useStoryState<string[]>('CheckboxGroupChange', [])
  return { value, handleChange }
}
export const Default = () => {
  const { value, handleChange } = useCheckboxGroupState()
  return (
    <CheckboxGroup label="Select options" options={options} value={value} onChange={handleChange} />
  )
}
export const WithDescription = () => {
  const { value, handleChange } = useCheckboxGroupState()
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={options}
      onChange={handleChange}
      description="Please select one or more options"
      value={value}
    />
  )
}
export const WithError = () => {
  const { value, handleChange } = useCheckboxGroupState()
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={options}
      onChange={handleChange}
      value={value}
      isInvalid
      errorMessage="Please select at least one fruit"
    />
  )
}
export const Disabled = () => {
  const { value, handleChange } = useCheckboxGroupState()
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={options}
      onChange={handleChange}
      value={value}
      isDisabled
    />
  )
}
export const Required = () => {
  const { value, handleChange } = useCheckboxGroupState()
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={options}
      onChange={handleChange}
      value={value}
      isRequired
    />
  )
}
export const WithDisabledOptions = () => {
  const { value, handleChange } = useCheckboxGroupState()
  const optionsWithDisabled = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana', isDisabled: true },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date', isDisabled: true },
    { label: 'Elderberry', value: 'elderberry' },
  ]
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={optionsWithDisabled}
      onChange={handleChange}
      value={value}
    />
  )
}
export const WithOptionDescriptions = () => {
  const { value, handleChange } = useCheckboxGroupState()
  const optionsWithDescriptions = [
    { label: 'Apple', value: 'apple', description: 'Kind of mid' },
    { label: 'Banana', value: 'banana', description: 'Depends on the banana' },
    { label: 'Cherry', value: 'cherry', description: 'Good in pies' },
    { label: 'Date', value: 'date', description: 'Not my favorite' },
    { label: 'Elderberry', value: 'elderberry', description: 'What even is this?' },
  ]
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={optionsWithDescriptions}
      onChange={handleChange}
      value={value}
    />
  )
}
export const WithPreselectedValues = () => {
  const { value, handleChange } = useCheckboxGroupState()
  return (
    <CheckboxGroup
      label="Select your favorite fruits"
      options={options}
      onChange={handleChange}
      value={value}
    />
  )
}
