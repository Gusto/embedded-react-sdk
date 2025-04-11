import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { NumberInput } from './NumberInput'
import { LocaleProvider } from '@/contexts/LocaleProvider'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/NumberInput', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => {
  const { value, handleAction } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput label="Amount" name="amount" value={value} onChange={handleAction} />
    </LocaleProvider>
  )
}

export const Currency: Story = () => {
  const { value, handleAction } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Price"
        name="price"
        value={value}
        onChange={handleAction}
        format="currency"
        currencyDisplay="symbol"
      />
    </LocaleProvider>
  )
}

export const Percent: Story = () => {
  const { value, handleAction } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Discount"
        name="discount"
        value={value}
        onChange={handleAction}
        format="percent"
        description="Enter discount percentage"
      />
    </LocaleProvider>
  )
}

export const Decimal: Story = () => {
  const { value, handleAction } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Quantity"
        name="quantity"
        value={value}
        onChange={handleAction}
        format="decimal"
      />
    </LocaleProvider>
  )
}

export const WithDescription: Story = () => {
  const { value, handleAction } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Quantity"
        name="quantity"
        value={value}
        onChange={handleAction}
        description="Enter the number of items"
      />
    </LocaleProvider>
  )
}

export const WithError: Story = () => {
  const { value, handleAction } = useLadleState<number>('NumberInputChange', 0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Age"
        name="age"
        value={value}
        onChange={handleAction}
        isInvalid
        errorMessage="Please enter a valid age"
      />
    </LocaleProvider>
  )
}
