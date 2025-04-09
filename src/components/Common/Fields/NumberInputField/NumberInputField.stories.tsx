import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { NumberInputField } from './NumberInputField'
import { LocaleProvider } from '@/contexts/LocaleProvider'

export const Default: Story = () => {
  return (
    <LocaleProvider locale="en-US" currency="USD">
      <FormWrapper>
        <NumberInputField label="Amount" name="amount" format="currency" />
        <NumberInputField label="Quantity" name="quantity" format="decimal" />
        <NumberInputField label="Percentage" name="percentage" format="percent" />
      </FormWrapper>
    </LocaleProvider>
  )
}

export const Required: Story = () => {
  return (
    <LocaleProvider locale="en-US" currency="USD">
      <FormWrapper>
        <NumberInputField
          label="Amount"
          name="amount"
          format="currency"
          isRequired
          errorMessage="Amount is required"
        />
        <NumberInputField
          label="Quantity"
          name="quantity"
          format="decimal"
          isRequired
          errorMessage="Quantity is required"
        />
        <NumberInputField
          label="Percentage"
          name="percentage"
          format="percent"
          isRequired
          errorMessage="Percentage is required"
        />
      </FormWrapper>
    </LocaleProvider>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <LocaleProvider locale="en-US" currency="USD">
      <FormWrapper
        defaultValues={{
          amount: 99.99,
          quantity: 42,
          percentage: 75,
        }}
      >
        <NumberInputField label="Amount" name="amount" format="currency" />
        <NumberInputField label="Quantity" name="quantity" format="decimal" />
        <NumberInputField label="Percentage" name="percentage" format="percent" />
      </FormWrapper>
    </LocaleProvider>
  )
}

export const WithValidation: Story = () => {
  return (
    <LocaleProvider locale="en-US" currency="USD">
      <FormWrapper>
        <NumberInputField
          label="Amount"
          name="amount"
          format="currency"
          min={10}
          max={1000}
          rules={{
            min: { value: 10, message: 'Amount must be at least $10' },
            max: { value: 1000, message: 'Amount cannot exceed $1,000' },
          }}
        />
        <NumberInputField
          label="Quantity"
          name="quantity"
          format="decimal"
          rules={{
            min: { value: 1, message: 'Quantity must be at least 1' },
            max: { value: 100, message: 'Quantity cannot exceed 100' },
          }}
        />
        <NumberInputField
          label="Percentage"
          name="percentage"
          format="percent"
          rules={{
            min: { value: 0, message: 'Percentage must be at least 0%' },
            max: { value: 100, message: 'Percentage cannot exceed 100%' },
          }}
        />
      </FormWrapper>
    </LocaleProvider>
  )
}
