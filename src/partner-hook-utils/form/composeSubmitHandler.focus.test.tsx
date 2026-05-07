import { describe, expect, it, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import type { BaseFormHookReady } from '../types'
import { composeSubmitHandler } from './composeSubmitHandler'
import { SDKFormProvider } from './SDKFormProvider'
import { useHookFormInternals } from './useHookFormInternals'
import { TextInputHookField } from './fields/TextInputHookField'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

type FormAValues = { firstNameA: string }
type FormBValues = { cityB: string }

function stubDomOrderRectsOnInputs() {
  return vi.spyOn(HTMLInputElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLInputElement,
  ) {
    const inputs = Array.from(document.querySelectorAll('input'))
    const index = inputs.indexOf(this)
    return {
      top: index * 30,
      left: 0,
      right: 0,
      bottom: index * 30,
      width: 0,
      height: 0,
      x: 0,
      y: index * 30,
      toJSON: () => ({}),
    } as DOMRect
  })
}

function ComposedFormsScreen({
  onAllValid = async () => {},
}: {
  onAllValid?: () => Promise<void>
}) {
  const formAMethods = useForm<FormAValues>({
    mode: 'onSubmit',
    shouldFocusError: false,
    defaultValues: { firstNameA: '' },
  })
  const formBMethods = useForm<FormBValues>({
    mode: 'onSubmit',
    shouldFocusError: false,
    defaultValues: { cityB: '' },
  })

  const hookAInternals = useHookFormInternals(formAMethods)
  const hookBInternals = useHookFormInternals(formBMethods)

  const formAResult = {
    errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
    form: { fieldsMetadata: {}, hookFormInternals: hookAInternals },
  }
  const formBResult = {
    errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
    form: { fieldsMetadata: {}, hookFormInternals: hookBInternals },
  }

  const { handleSubmit } = composeSubmitHandler([formAResult, formBResult], onAllValid)

  return (
    <form onSubmit={handleSubmit}>
      <SDKFormProvider formHookResult={formBResult}>
        <TextInputField name="cityB" label="City B" isRequired />
      </SDKFormProvider>
      <SDKFormProvider formHookResult={formAResult}>
        <TextInputField name="firstNameA" label="First Name A" isRequired />
      </SDKFormProvider>
      <button type="submit">Submit</button>
    </form>
  )
}

function InterleavedHookFieldsScreen({
  onAllValid = async () => {},
}: {
  onAllValid?: () => Promise<void>
}) {
  const formAMethods = useForm<FormAValues>({
    mode: 'onSubmit',
    shouldFocusError: false,
    defaultValues: { firstNameA: '' },
  })
  const formBMethods = useForm<FormBValues>({
    mode: 'onSubmit',
    shouldFocusError: false,
    defaultValues: { cityB: '' },
  })

  const hookAInternals = useHookFormInternals(formAMethods)
  const hookBInternals = useHookFormInternals(formBMethods)

  const formAResult = {
    isLoading: false as const,
    data: {},
    status: { isPending: false, mode: 'create' as const },
    actions: {},
    errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
    form: {
      Fields: {},
      fieldsMetadata: { firstNameA: { name: 'firstNameA', isRequired: true } },
      hookFormInternals: hookAInternals,
      getFormSubmissionValues: () => undefined,
    },
  }
  const formBResult = {
    isLoading: false as const,
    data: {},
    status: { isPending: false, mode: 'create' as const },
    actions: {},
    errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
    form: {
      Fields: {},
      fieldsMetadata: { cityB: { name: 'cityB', isRequired: true } },
      hookFormInternals: hookBInternals,
      getFormSubmissionValues: () => undefined,
    },
  }

  const { handleSubmit } = composeSubmitHandler([formAResult, formBResult], onAllValid)

  return (
    <form onSubmit={handleSubmit}>
      <TextInputHookField
        name="cityB"
        label="City B"
        formHookResult={formBResult as unknown as BaseFormHookReady}
      />
      <TextInputHookField
        name="firstNameA"
        label="First Name A"
        formHookResult={formAResult as unknown as BaseFormHookReady}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

describe('composeSubmitHandler — cross-form DOM-order focus', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('focuses the visually first invalid field, even when its form is later in the forms array', async () => {
    stubDomOrderRectsOnInputs()
    const user = userEvent.setup()
    const onAllValid = vi.fn()

    renderWithProviders(<ComposedFormsScreen onAllValid={onAllValid} />)

    const cityB = screen.getByLabelText(/City B/i)
    const firstNameA = screen.getByLabelText(/First Name A/i)

    expect(document.activeElement).not.toBe(cityB)
    expect(document.activeElement).not.toBe(firstNameA)

    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(document.activeElement).toBe(cityB)
    })
    expect(onAllValid).not.toHaveBeenCalled()
  })

  it('works for interleaved HookFields using the formHookResult prop (no SDKFormProvider)', async () => {
    stubDomOrderRectsOnInputs()
    const user = userEvent.setup()
    const onAllValid = vi.fn()

    renderWithProviders(<InterleavedHookFieldsScreen onAllValid={onAllValid} />)

    const cityB = screen.getByLabelText(/City B/i)
    const firstNameA = screen.getByLabelText(/First Name A/i)

    expect(document.activeElement).not.toBe(cityB)
    expect(document.activeElement).not.toBe(firstNameA)

    await user.click(screen.getByRole('button', { name: /Submit/i }))

    await waitFor(() => {
      expect(document.activeElement).toBe(cityB)
    })
    expect(onAllValid).not.toHaveBeenCalled()
  })
})
