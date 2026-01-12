import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { TextInput } from './TextInput'
// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/TextInput', // Updated to be under UI/Form instead of top-level Form
}
export const Default = () => {
  const { value, handleChange } = useStoryState<string>('TextInputChange', '')
  return <TextInput label="Email" name="email" type="email" value={value} onChange={handleChange} />
}
export const Description = () => {
  const { value, handleChange } = useStoryState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      description="Please enter your email address"
      onChange={handleChange}
    />
  )
}
export const Error = () => {
  const { value, handleChange } = useStoryState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      isInvalid
      errorMessage="Please enter a valid email address"
      onChange={handleChange}
    />
  )
}
export const AdornmentStart = () => {
  const { value, handleChange } = useStoryState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Username"
      name="username"
      type="text"
      value={value}
      onChange={handleChange}
      adornmentStart="@"
    />
  )
}
export const AdornmentEnd = () => {
  const { value, handleChange } = useStoryState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Website"
      name="website"
      type="text"
      value={value}
      onChange={handleChange}
      adornmentEnd=".com"
    />
  )
}
export const AdornmentStartAndEnd = () => {
  const { value, handleChange } = useStoryState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Search"
      name="search"
      type="text"
      value={value}
      onChange={handleChange}
      adornmentStart="🔍"
      adornmentEnd="..."
    />
  )
}
