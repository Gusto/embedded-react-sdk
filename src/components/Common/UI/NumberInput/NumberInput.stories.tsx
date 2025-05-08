import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { NumberInput } from './NumberInput'
import { LocaleProvider } from '@/contexts/LocaleProvider'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/NumberInput', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput label="Amount" name="amount" value={value} onChange={handleChange} />
    </LocaleProvider>
  )
}

export const Currency: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Price"
        name="price"
        value={value}
        onChange={handleChange}
        format="currency"
      />
    </LocaleProvider>
  )
}

export const Percent: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Discount"
        name="discount"
        value={value}
        onChange={handleChange}
        format="percent"
        description="Enter discount percentage"
      />
    </LocaleProvider>
  )
}

export const Decimal: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Quantity"
        name="quantity"
        value={value}
        onChange={handleChange}
        format="decimal"
      />
    </LocaleProvider>
  )
}

export const WithDescription: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Quantity"
        name="quantity"
        value={value}
        onChange={handleChange}
        description="Enter the number of items"
      />
    </LocaleProvider>
  )
}

export const WithError: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Age"
        name="age"
        value={value}
        onChange={handleChange}
        isInvalid
        errorMessage="Please enter a valid age"
      />
    </LocaleProvider>
  )
}

export const WithAdornmentEnd: Story = () => {
  const { value, handleChange } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Pay rate"
        name="pay-rate"
        value={value}
        onChange={handleChange}
        format="currency"
        adornmentEnd="/hr"
        isRequired
      />
    </LocaleProvider>
  )
}
