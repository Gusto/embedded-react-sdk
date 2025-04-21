import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { Radio } from './Radio'

export default {
  title: 'UI/Form/Inputs/Radio',
}

export const Default: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('RadioChange', false)
  return (
    <Radio label="Select this option" name="radio-option" onChange={handleChange} value={value} />
  )
}

export const WithDescription: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('RadioChange', false)
  return (
    <Radio
      label="Subscribe to newsletter"
      name="newsletter"
      description="Receive updates about new features and promotions"
      onChange={handleChange}
      value={value}
    />
  )
}

export const WithError: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('RadioChange', false)
  return (
    <Radio
      label="Select this option"
      name="radio-option"
      isInvalid
      errorMessage="This field is required"
      description="Please select an option to continue"
      onChange={handleChange}
      value={value}
    />
  )
}

export const Disabled: Story = () => {
  return <Radio label="This option is not available" name="disabled" isDisabled value={false} />
}

export const DisabledChecked: Story = () => {
  return (
    <Radio label="This option is not available" name="disabled-checked" isDisabled value={true} />
  )
}
