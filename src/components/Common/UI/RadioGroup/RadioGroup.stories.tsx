import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { RadioGroup } from './RadioGroup'

export default {
  title: 'UI/Form/Inputs/RadioGroup',
}

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
]

function useRadioGroupState(initialValue?: string) {
  const { value, handleChange } = useLadleState<string>('RadioGroupChange', initialValue || '')
  return { value, handleChange }
}

export const Default: Story = () => {
  const { value, handleChange } = useRadioGroupState()
  return (
    <RadioGroup label="Select option" options={options} value={value} onChange={handleChange} />
  )
}

export const WithDescription: Story = () => {
  const { value, handleChange } = useRadioGroupState()
  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={options}
      onChange={handleChange}
      description="Please select one option"
      value={value}
    />
  )
}

export const WithError: Story = () => {
  const { value, handleChange } = useRadioGroupState()
  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={options}
      onChange={handleChange}
      value={value}
      isInvalid
      errorMessage="Please select a fruit"
    />
  )
}

export const Disabled: Story = () => {
  const { value, handleChange } = useRadioGroupState()
  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={options}
      onChange={handleChange}
      value={value}
      isDisabled
    />
  )
}

export const Required: Story = () => {
  const { value, handleChange } = useRadioGroupState()
  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={options}
      onChange={handleChange}
      value={value}
      isRequired
    />
  )
}

export const WithDisabledOptions: Story = () => {
  const { value, handleChange } = useRadioGroupState('apple')

  const optionsWithDisabled = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana', isDisabled: true },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date', isDisabled: true },
    { label: 'Elderberry', value: 'elderberry' },
  ]

  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={optionsWithDisabled}
      onChange={handleChange}
      value={value}
    />
  )
}

export const WithPreselectedValue: Story = () => {
  const { value, handleChange } = useLadleState<string>('RadioGroupChange', 'apple')
  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={options}
      onChange={handleChange}
      value={value}
    />
  )
}

export const WithOptionDescriptions: Story = () => {
  const { value, handleChange } = useRadioGroupState()

  const optionsWithDescriptions = [
    {
      label: 'Apple',
      value: 'apple',
      description: 'A sweet, crisp fruit that comes in many varieties',
    },
    {
      label: 'Banana',
      value: 'banana',
      description: 'A curved yellow fruit with soft sweet flesh',
    },
    {
      label: 'Cherry',
      value: 'cherry',
      description: 'A small, round stone fruit that is typically bright or dark red',
    },
    {
      label: 'Date',
      value: 'date',
      description: 'A sweet brownish-black fruit with a wrinkled surface',
    },
    {
      label: 'Elderberry',
      value: 'elderberry',
      description: 'A small, dark purple berry that grows in clusters',
    },
  ]

  return (
    <RadioGroup
      label="Select your favorite fruit"
      options={optionsWithDescriptions}
      onChange={handleChange}
      value={value}
      description="Each option includes a description to help you make your choice"
    />
  )
}
