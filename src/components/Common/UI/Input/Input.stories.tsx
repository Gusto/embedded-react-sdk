import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { Input } from './Input'
// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Input',
}
export const Default = () => {
  const { value, handleChange } = useStoryState<string>('InputChange', '')
  return (
    <Input
      placeholder="Enter text"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      aria-invalid
    />
  )
}
export const Leading = () => {
  const { value, handleChange } = useStoryState<string>('InputLeadingChange', '')
  return (
    <Input
      placeholder="Enter amount"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      adornmentStart="$"
    />
  )
}
export const Trailing = () => {
  const { value, handleChange } = useStoryState<string>('InputTrailingChange', '')
  return (
    <Input
      placeholder="Enter percentage"
      value={value}
      onChange={e => handleChange(e.currentTarget.value)}
      adornmentEnd="%"
    />
  )
}
export const LeadingAndTrailing = () => {
  const { value, handleChange } = useStoryState<string>('InputBothChange', '')
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
export const Disabled = () => {
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
export const Invalid = () => {
  const { value, handleChange } = useStoryState<string>('InputInvalidChange', '24.00')
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
