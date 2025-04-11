import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { Checkbox } from './Checkbox'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Checkbox', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('CheckboxChange', false)
  return (
    <Checkbox
      label="Accept terms and conditions"
      name="terms"
      checked={value}
      onChange={handleCheckboxChange}
    />
  )
}

export const WithDescription: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('CheckboxChange', false)
  return (
    <Checkbox
      label="Subscribe to newsletter"
      name="newsletter"
      description="Receive updates about new features and promotions"
      checked={value}
      onChange={handleCheckboxChange}
    />
  )
}

export const WithError: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('CheckboxChange', false)
  return (
    <Checkbox
      label="Accept terms and conditions"
      name="terms"
      isInvalid
      errorMessage="You must accept the terms to continue"
      description="Receive updates about new features and promotions"
      checked={value}
      onChange={handleCheckboxChange}
    />
  )
}

export const Disabled: Story = () => {
  return <Checkbox label="This option is not available" name="disabled" isDisabled />
}

export const DisabledChecked: Story = () => {
  return (
    <Checkbox
      label="This option is not available"
      name="disabled-checked"
      isDisabled
      checked={true}
    />
  )
}
