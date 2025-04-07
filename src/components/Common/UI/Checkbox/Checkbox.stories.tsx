import type { Story } from '@ladle/react'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

export const Default: Story = () => {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox
      label="Accept terms and conditions"
      name="terms"
      checked={checked}
      onChange={event => {
        setChecked(event.target.checked)
      }}
    />
  )
}

export const WithDescription: Story = () => {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox
      label="Subscribe to newsletter"
      name="newsletter"
      description="Receive updates about new features and promotions"
      checked={checked}
      onChange={event => {
        setChecked(event.target.checked)
      }}
    />
  )
}

export const WithError: Story = () => {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox
      label="Accept terms and conditions"
      name="terms"
      isInvalid
      errorMessage="You must accept the terms to continue"
      description="Receive updates about new features and promotions"
      checked={checked}
      onChange={event => {
        setChecked(event.target.checked)
      }}
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
