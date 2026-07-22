import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { useForm, useFormContext, useFormState } from 'react-hook-form'
import type { FieldMetadata } from '../types'
import { SDKFormProvider } from './SDKFormProvider'
import type { SDKError, SDKFieldError } from '@/types/sdkError'

type TestFormValues = { street1: string; city: string }

function fieldError(field: string, message: string): SDKFieldError {
  return { field, message, category: 'invalid_attribute_value' }
}

function apiError(fieldErrors: SDKFieldError[]): SDKError {
  return {
    category: 'api_error',
    message: 'We found some errors',
    httpStatus: 422,
    fieldErrors,
  }
}

function TextInput({ name, label }: { name: keyof TestFormValues; label: string }) {
  const { register } = useFormContext<TestFormValues>()
  return <input aria-label={label} {...register(name)} />
}

function ErrorProbe() {
  const { errors } = useFormState<TestFormValues>()
  return (
    <>
      <span data-testid="error-street1">{errors.street1?.message ?? ''}</span>
      <span data-testid="error-city">{errors.city?.message ?? ''}</span>
    </>
  )
}

function Harness({ errors }: { errors: SDKError[] }) {
  const [renderCount, forceRender] = useState(0)
  const formMethods = useForm<TestFormValues>({ defaultValues: { street1: '', city: '' } })

  const fieldsMetadata: Record<'street1' | 'city', FieldMetadata> = {
    street1: { name: 'street1' },
    city: { name: 'city' },
  }

  const formHookResult = {
    errorHandling: { errors },
    form: {
      fieldsMetadata,
      hookFormInternals: { formMethods },
    },
  }

  return (
    <SDKFormProvider formHookResult={formHookResult}>
      {errors.length > 0 && <div data-testid="banner">{errors[0]!.message}</div>}
      <TextInput name="street1" label="Street" />
      <TextInput name="city" label="City" />
      <ErrorProbe />
      <button
        type="button"
        onClick={() => {
          forceRender(count => count + 1)
        }}
      >
        rerender {renderCount}
      </button>
    </SDKFormProvider>
  )
}

describe('SDKFormProvider field-error syncing', () => {
  it('applies API field errors to their fields', async () => {
    render(<Harness errors={[apiError([fieldError('street1', 'Street is invalid')])]} />)

    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('Street is invalid')
    })
  })

  it('clears a field error when the user changes that field, leaving the banner intact', async () => {
    const user = userEvent.setup()
    render(<Harness errors={[apiError([fieldError('street1', 'Street is invalid')])]} />)

    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('Street is invalid')
    })

    await user.type(screen.getByLabelText('Street'), 'a')

    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('')
    })
    expect(screen.getByTestId('banner')).toHaveTextContent('We found some errors')
  })

  it('only clears the changed field, leaving other fields errors intact', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        errors={[
          apiError([
            fieldError('street1', 'Street is invalid'),
            fieldError('city', 'City is invalid'),
          ]),
        ]}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('Street is invalid')
      expect(screen.getByTestId('error-city')).toHaveTextContent('City is invalid')
    })

    await user.type(screen.getByLabelText('Street'), 'a')

    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('')
    })
    expect(screen.getByTestId('error-city')).toHaveTextContent('City is invalid')
  })

  it('does not re-apply a cleared error on an unrelated re-render', async () => {
    const user = userEvent.setup()
    render(<Harness errors={[apiError([fieldError('street1', 'Street is invalid')])]} />)

    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('Street is invalid')
    })

    await user.type(screen.getByLabelText('Street'), 'a')
    await waitFor(() => {
      expect(screen.getByTestId('error-street1')).toHaveTextContent('')
    })

    await user.click(screen.getByRole('button', { name: /rerender/i }))

    // The fresh-array-every-render instability must not resurrect the cleared error.
    expect(screen.getByTestId('error-street1')).toHaveTextContent('')
  })
})
