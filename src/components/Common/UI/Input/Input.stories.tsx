import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { Input } from './Input'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Input',
}

export const Default: Story = () => {
  const { value, handleChange } = useLadleState<string>('InputChange', '')
  return (
    <Input
      placeholder="Enter text"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      aria-invalid
    />
  )
}

export const Leading: Story = () => {
  const { value, handleChange } = useLadleState<string>('InputLeadingChange', '')
  return (
    <Input
      placeholder="Enter amount"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      adornmentStart="$"
    />
  )
}

export const Trailing: Story = () => {
  const { value, handleChange } = useLadleState<string>('InputTrailingChange', '')
  return (
    <Input
      placeholder="Enter percentage"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      adornmentEnd="%"
    />
  )
}

export const LeadingAndTrailing: Story = () => {
  const { value, handleChange } = useLadleState<string>('InputBothChange', '')
  return (
    <Input
      placeholder="Enter rate"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      adornmentStart="$"
      adornmentEnd="/hr"
    />
  )
}

export const Disabled: Story = () => {
  return (
    <Input
      placeholder="Disabled input"
      value="Cannot edit this"
      isDisabled
      adornmentStart="$"
      adornmentEnd="/hr"
    />
  )
}

export const Invalid: Story = () => {
  const { value, handleChange } = useLadleState<string>('InputInvalidChange', '24.00')
  return (
    <Input
      placeholder="Enter rate"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      adornmentStart="$"
      adornmentEnd="/hr"
      aria-invalid={true}
    />
  )
}
