import type { Story } from '@ladle/react'
import { useState } from 'react'
import { TextInput } from './TextInput'

export const Default: Story = () => {
  const [value, setValue] = useState('')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      onChange={event => {
        setValue(event.target.value)
      }}
    />
  )
}

export const Description: Story = () => {
  const [value, setValue] = useState('')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      description="Please enter your email address"
      onChange={event => {
        setValue(event.target.value)
      }}
    />
  )
}

export const Error: Story = () => {
  const [value, setValue] = useState('')
  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      value={value}
      isInvalid
      errorMessage="Please enter a valid email address"
      onChange={event => {
        setValue(event.target.value)
      }}
    />
  )
}
