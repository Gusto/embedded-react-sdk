import { describe, expect, it, vi, type Mock } from 'vitest'
import { composeSubmitHandler } from './composeSubmitHandler'

type ComposableForm = Parameters<typeof composeSubmitHandler>[0][number]

interface MockFormMethods {
  handleSubmit: Mock
  setFocus: Mock
  formState: { errors: Record<string, { message: string }> }
}

function createMockForm(
  overrides: {
    isValid?: boolean
    errorFields?: string[]
  } = {},
): ComposableForm & { formMethods: MockFormMethods } {
  const { isValid = true, errorFields = [] } = overrides

  const errors: Record<string, { message: string }> = {}
  for (const field of errorFields) {
    errors[field] = { message: 'validation_error' }
  }

  const handleSubmit = vi.fn((onValid: () => void, onInvalid?: () => void) => {
    return async () => {
      if (isValid) {
        onValid()
      } else {
        onInvalid?.()
      }
    }
  })

  const formMethods: MockFormMethods = {
    handleSubmit,
    setFocus: vi.fn(),
    formState: { errors },
  }

  return {
    form: { hookFormInternals: { formMethods: formMethods as never } },
    formMethods,
  }
}

function createMockEvent() {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent
}

describe('composeSubmitHandler', () => {
  it('calls preventDefault on the form event', async () => {
    const form = createMockForm()
    const onAllValid = vi.fn()
    const event = createMockEvent()

    const handler = composeSubmitHandler([form], onAllValid)
    await handler(event)

    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  it('calls onAllValid when all forms pass validation', async () => {
    const form1 = createMockForm({ isValid: true })
    const form2 = createMockForm({ isValid: true })
    const onAllValid = vi.fn()

    const handler = composeSubmitHandler([form1, form2], onAllValid)
    await handler(createMockEvent())

    expect(form1.formMethods.handleSubmit).toHaveBeenCalledOnce()
    expect(form2.formMethods.handleSubmit).toHaveBeenCalledOnce()
    expect(onAllValid).toHaveBeenCalledOnce()
    expect(form1.formMethods.setFocus).not.toHaveBeenCalled()
    expect(form2.formMethods.setFocus).not.toHaveBeenCalled()
  })

  it('validates all forms simultaneously', async () => {
    const form1 = createMockForm()
    const form2 = createMockForm()
    const onAllValid = vi.fn()

    const handler = composeSubmitHandler([form1, form2], onAllValid)
    await handler(createMockEvent())

    const form1Order = form1.formMethods.handleSubmit.mock.invocationCallOrder[0]!
    const form2Order = form2.formMethods.handleSubmit.mock.invocationCallOrder[0]!
    expect(Math.abs(form1Order - form2Order)).toBeLessThanOrEqual(1)
  })

  it('focuses the first invalid field when the first form is invalid', async () => {
    const form1 = createMockForm({
      isValid: false,
      errorFields: ['street1', 'city'],
    })
    const form2 = createMockForm({ isValid: true })
    const onAllValid = vi.fn()

    const handler = composeSubmitHandler([form1, form2], onAllValid)
    await handler(createMockEvent())

    expect(onAllValid).not.toHaveBeenCalled()
    expect(form1.formMethods.setFocus).toHaveBeenCalledWith('street1')
    expect(form2.formMethods.setFocus).not.toHaveBeenCalled()
  })

  it('focuses the first invalid field of the second form when only it is invalid', async () => {
    const form1 = createMockForm({ isValid: true })
    const form2 = createMockForm({
      isValid: false,
      errorFields: ['employeeId', 'startDate'],
    })
    const onAllValid = vi.fn()

    const handler = composeSubmitHandler([form1, form2], onAllValid)
    await handler(createMockEvent())

    expect(onAllValid).not.toHaveBeenCalled()
    expect(form1.formMethods.setFocus).not.toHaveBeenCalled()
    expect(form2.formMethods.setFocus).toHaveBeenCalledWith('employeeId')
  })

  it('focuses the first invalid field of the first form when multiple forms are invalid', async () => {
    const form1 = createMockForm({
      isValid: false,
      errorFields: ['firstName'],
    })
    const form2 = createMockForm({
      isValid: false,
      errorFields: ['street1'],
    })
    const onAllValid = vi.fn()

    const handler = composeSubmitHandler([form1, form2], onAllValid)
    await handler(createMockEvent())

    expect(onAllValid).not.toHaveBeenCalled()
    expect(form1.formMethods.setFocus).toHaveBeenCalledWith('firstName')
    expect(form2.formMethods.setFocus).not.toHaveBeenCalled()
  })

  it('does not call onAllValid when validation fails even with no focusable error fields', async () => {
    const form1 = createMockForm({ isValid: false, errorFields: [] })
    const onAllValid = vi.fn()

    const handler = composeSubmitHandler([form1], onAllValid)
    await handler(createMockEvent())

    expect(onAllValid).not.toHaveBeenCalled()
  })
})
