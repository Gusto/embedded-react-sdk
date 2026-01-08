import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { Checkbox } from './Checkbox'
export default {
  title: 'UI/Form/Inputs/Checkbox',
}
export const Default = () => {
  const { value, handleChange } = useStoryState<boolean>('CheckboxChange', false)
  return (
    <Checkbox
      label="Accept terms and conditions"
      name="terms"
      value={value}
      onChange={handleChange}
    />
  )
}
export const WithDescription = () => {
  const { value, handleChange } = useStoryState<boolean>('CheckboxChange', false)
  return (
    <Checkbox
      label="Subscribe to newsletter"
      name="newsletter"
      description="Receive updates about new features and promotions"
      value={value}
      onChange={handleChange}
    />
  )
}
export const WithError = () => {
  const { value, handleChange } = useStoryState<boolean>('CheckboxChange', false)
  return (
    <Checkbox
      label="Accept terms and conditions"
      name="terms"
      isInvalid
      errorMessage="You must accept the terms to continue"
      description="Receive updates about new features and promotions"
      value={value}
      onChange={handleChange}
    />
  )
}
export const Disabled = () => {
  return <Checkbox label="This option is not available" name="disabled" isDisabled />
}
export const DisabledChecked = () => {
  return (
    <Checkbox
      label="This option is not available"
      name="disabled-checked"
      isDisabled
      value={true}
    />
  )
}
