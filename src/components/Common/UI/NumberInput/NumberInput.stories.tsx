import type { Story } from '@ladle/react'
import { useState } from 'react'
import { NumberInput } from './NumberInput'
import { LocaleProvider } from '@/contexts/LocaleProvider'

export const Default: Story = () => {
  const [value, setValue] = useState(0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput label="Amount" name="amount" value={value} onChange={setValue} />
    </LocaleProvider>
  )
}

export const Currency: Story = () => {
  const [value, setValue] = useState(0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Price"
        name="price"
        value={value}
        onChange={setValue}
        format="currency"
        currencyDisplay="symbol"
      />
    </LocaleProvider>
  )
}

export const Percent: Story = () => {
  const [value, setValue] = useState(0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Discount"
        name="discount"
        value={value}
        onChange={setValue}
        format="percent"
        description="Enter discount percentage"
      />
    </LocaleProvider>
  )
}

export const Decimal: Story = () => {
  const [value, setValue] = useState(0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Quantity"
        name="quantity"
        value={value}
        onChange={setValue}
        format="decimal"
      />
    </LocaleProvider>
  )
}

export const WithDescription: Story = () => {
  const [value, setValue] = useState(0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Quantity"
        name="quantity"
        value={value}
        onChange={setValue}
        description="Enter the number of items"
      />
    </LocaleProvider>
  )
}

export const WithError: Story = () => {
  const [value, setValue] = useState(0)

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <NumberInput
        label="Age"
        name="age"
        value={value}
        onChange={setValue}
        isInvalid
        errorMessage="Please enter a valid age"
      />
    </LocaleProvider>
  )
}
