import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { TextInput } from './TextInput'

export const Default: Story = () => {
  const { value, handleInputChange } = useLadleState<string>('TextInputChange', '')
  return (
    <TextInput label="Email" name="email" type="email" value={value} onChange={handleInputChange} />
  )
}

export const Description: Story = () => {
  const { value, handleInputChange } = useLadleState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      description="Please enter your email address"
      onChange={handleInputChange}
    />
  )
}

export const Error: Story = () => {
  const { value, handleInputChange } = useLadleState<string>('TextInputChange', '')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      isInvalid
      errorMessage="Please enter a valid email address"
      onChange={handleInputChange}
    />
  )
}
