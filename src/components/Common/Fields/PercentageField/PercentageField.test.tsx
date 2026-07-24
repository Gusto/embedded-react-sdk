import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { PercentageField } from './PercentageField'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

interface TestFormValues {
  rate: string
}

function TestForm({
  decimalMin,
  decimalMax,
  decimalValue,
}: {
  decimalMin?: string
  decimalMax?: string
  decimalValue?: string
}) {
  const methods = useForm<TestFormValues>({ defaultValues: { rate: decimalValue ?? '' } })
  return (
    <GustoTestProvider>
      <FormProvider {...methods}>
        <PercentageField
          name="rate"
          label="Tax rate"
          decimalValue={decimalValue}
          decimalMin={decimalMin}
          decimalMax={decimalMax}
        />
      </FormProvider>
    </GustoTestProvider>
  )
}

describe('PercentageField', () => {
  it('displays the decimal value as a percentage', () => {
    render(<TestForm decimalValue="0.02" />)
    expect(screen.getByLabelText(/Tax rate/i)).toHaveValue('2')
  })

  it('keeps an out-of-range value visible instead of silently clamping it to decimalMax', async () => {
    const user = userEvent.setup()
    render(<TestForm decimalValue="0.02" decimalMin="0.015" decimalMax="0.062" />)
    const input = screen.getByLabelText(/Tax rate/i)

    await user.clear(input)
    await user.type(input, '8')
    await user.tab()

    expect(input).toHaveValue('8')
  })

  it('shows an error when the value exceeds decimalMax', async () => {
    const user = userEvent.setup()
    render(<TestForm decimalValue="0.02" decimalMin="0.015" decimalMax="0.062" />)
    const input = screen.getByLabelText(/Tax rate/i)

    await user.clear(input)
    await user.type(input, '8')
    await user.tab()

    expect(await screen.findByText('Maximum value is 6.2%')).toBeInTheDocument()
  })

  it('shows an error when the value is below decimalMin', async () => {
    const user = userEvent.setup()
    render(<TestForm decimalValue="0.02" decimalMin="0.015" decimalMax="0.062" />)
    const input = screen.getByLabelText(/Tax rate/i)

    await user.clear(input)
    await user.type(input, '1')
    await user.tab()

    expect(await screen.findByText('Minimum value is 1.5%')).toBeInTheDocument()
  })

  it('clears the error once the value is back in range', async () => {
    const user = userEvent.setup()
    render(<TestForm decimalValue="0.02" decimalMin="0.015" decimalMax="0.062" />)
    const input = screen.getByLabelText(/Tax rate/i)

    await user.clear(input)
    await user.type(input, '8')
    await user.tab()
    expect(await screen.findByText('Maximum value is 6.2%')).toBeInTheDocument()

    await user.click(input)
    await user.clear(input)
    await user.type(input, '5')
    await user.tab()

    expect(screen.queryByText('Maximum value is 6.2%')).not.toBeInTheDocument()
  })
})
