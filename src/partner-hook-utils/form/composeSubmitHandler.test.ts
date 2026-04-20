import { describe, expect, it, vi, type Mock } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'
import { composeSubmitHandler } from './composeSubmitHandler'
import { composeErrorHandler } from '../composeErrorHandler'
import type { HookErrorHandling } from '../types'
import type { SDKError } from '@/types/sdkError'

type ComposableForm = Parameters<typeof composeSubmitHandler>[0][number]

interface MockFormMethods {
  handleSubmit: Mock
  setFocus: Mock
  formState: { errors: Record<string, { message: string }> }
}

function createMockError(message: string): SDKError {
  return {
    message,
    category: 'internal_error',
    fieldErrors: [],
  }
}

function createMockErrorHandling(
  overrides: Partial<HookErrorHandling> = {},
): HookErrorHandling & { retryQueries: Mock; clearSubmitError: Mock } {
  return {
    errors: overrides.errors ?? [],
    retryQueries: vi.fn(),
    clearSubmitError: vi.fn(),
  }
}

function createMockForm(
  overrides: {
    isValid?: boolean
    errorFields?: string[]
    errorHandling?: HookErrorHandling
  } = {},
): ComposableForm & {
  formMethods: MockFormMethods
  errorHandling: HookErrorHandling & { retryQueries: Mock; clearSubmitError: Mock }
} {
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

  const errorHandling =
    (overrides.errorHandling as
      | (HookErrorHandling & { retryQueries: Mock; clearSubmitError: Mock })
      | undefined) ?? createMockErrorHandling()

  return {
    form: { hookFormInternals: { formMethods: formMethods as never } },
    errorHandling,
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

    const { handleSubmit } = composeSubmitHandler([form], onAllValid)
    await handleSubmit(event)

    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  it('calls onAllValid when all forms pass validation', async () => {
    const form1 = createMockForm({ isValid: true })
    const form2 = createMockForm({ isValid: true })
    const onAllValid = vi.fn()

    const { handleSubmit } = composeSubmitHandler([form1, form2], onAllValid)
    await handleSubmit(createMockEvent())

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

    const { handleSubmit } = composeSubmitHandler([form1, form2], onAllValid)
    await handleSubmit(createMockEvent())

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

    const { handleSubmit } = composeSubmitHandler([form1, form2], onAllValid)
    await handleSubmit(createMockEvent())

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

    const { handleSubmit } = composeSubmitHandler([form1, form2], onAllValid)
    await handleSubmit(createMockEvent())

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

    const { handleSubmit } = composeSubmitHandler([form1, form2], onAllValid)
    await handleSubmit(createMockEvent())

    expect(onAllValid).not.toHaveBeenCalled()
    expect(form1.formMethods.setFocus).toHaveBeenCalledWith('firstName')
    expect(form2.formMethods.setFocus).not.toHaveBeenCalled()
  })

  it('does not call onAllValid when validation fails even with no focusable error fields', async () => {
    const form1 = createMockForm({ isValid: false, errorFields: [] })
    const onAllValid = vi.fn()

    const { handleSubmit } = composeSubmitHandler([form1], onAllValid)
    await handleSubmit(createMockEvent())

    expect(onAllValid).not.toHaveBeenCalled()
  })

  describe('aggregated errorHandling', () => {
    it('aggregates errors across all forms', () => {
      const error1 = createMockError('Details fetch failed')
      const error2 = createMockError('Address fetch failed')

      const form1 = createMockForm({
        errorHandling: createMockErrorHandling({ errors: [error1] }),
      })
      const form2 = createMockForm({
        errorHandling: createMockErrorHandling({ errors: [error2] }),
      })

      const { errorHandling } = composeSubmitHandler([form1, form2], vi.fn())

      expect(errorHandling.errors.map(e => e.message)).toEqual([
        'Details fetch failed',
        'Address fetch failed',
      ])
    })

    it('calls retryQueries on every form when errorHandling.retryQueries is invoked', () => {
      const form1 = createMockForm()
      const form2 = createMockForm()

      const { errorHandling } = composeSubmitHandler([form1, form2], vi.fn())
      errorHandling.retryQueries()

      expect(form1.errorHandling.retryQueries).toHaveBeenCalledOnce()
      expect(form2.errorHandling.retryQueries).toHaveBeenCalledOnce()
    })

    it('calls clearSubmitError on every form when errorHandling.clearSubmitError is invoked', () => {
      const form1 = createMockForm()
      const form2 = createMockForm()

      const { errorHandling } = composeSubmitHandler([form1, form2], vi.fn())
      errorHandling.clearSubmitError()

      expect(form1.errorHandling.clearSubmitError).toHaveBeenCalledOnce()
      expect(form2.errorHandling.clearSubmitError).toHaveBeenCalledOnce()
    })

    it('returned result plugs back into composeErrorHandler with extras', () => {
      const formError = createMockError('Form-level error')
      const queryError = new Error('Extra query failed')
      const submitError = createMockError('Submit failed')

      const form = createMockForm({
        errorHandling: createMockErrorHandling({ errors: [formError] }),
      })

      const submitResult = composeSubmitHandler([form], vi.fn())

      const extraRefetch = vi.fn().mockResolvedValue({})
      const extraQuery = { error: queryError, refetch: extraRefetch }
      const setSubmitError = vi.fn()

      const combined = composeErrorHandler([submitResult, extraQuery], {
        submitError,
        setSubmitError,
      })

      expect(combined.errors.map(e => e.message)).toEqual([
        'Form-level error',
        'Extra query failed',
        'Submit failed',
      ])

      combined.retryQueries()
      expect(form.errorHandling.retryQueries).toHaveBeenCalledOnce()
      expect(extraRefetch).toHaveBeenCalledOnce()

      combined.clearSubmitError()
      expect(form.errorHandling.clearSubmitError).toHaveBeenCalledOnce()
      expect(setSubmitError).toHaveBeenCalledWith(null)
    })
  })

  describe('raw UseFormReturn slots', () => {
    function createMockRawForm(
      overrides: { isValid?: boolean; errorFields?: string[] } = {},
    ): UseFormReturn<{ startDate: string }> & {
      handleSubmit: Mock
      setFocus: Mock
    } {
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

      const mock = {
        handleSubmit,
        setFocus: vi.fn(),
        formState: { errors },
      } as unknown as UseFormReturn<{ startDate: string }> & {
        handleSubmit: Mock
        setFocus: Mock
      }

      return mock
    }

    it('calls onAllValid when a raw form and an SDK form are both valid', async () => {
      const sdkForm = createMockForm({ isValid: true })
      const rawForm = createMockRawForm({ isValid: true })
      const onAllValid = vi.fn()

      const { handleSubmit } = composeSubmitHandler([sdkForm, rawForm], onAllValid)
      await handleSubmit(createMockEvent())

      expect(sdkForm.formMethods.handleSubmit).toHaveBeenCalledOnce()
      expect(rawForm.handleSubmit).toHaveBeenCalledOnce()
      expect(onAllValid).toHaveBeenCalledOnce()
    })

    it('focuses the first invalid field on a raw form when it fails validation', async () => {
      const sdkForm = createMockForm({ isValid: true })
      const rawForm = createMockRawForm({
        isValid: false,
        errorFields: ['startDate'],
      })
      const onAllValid = vi.fn()

      const { handleSubmit } = composeSubmitHandler([sdkForm, rawForm], onAllValid)
      await handleSubmit(createMockEvent())

      expect(onAllValid).not.toHaveBeenCalled()
      expect(rawForm.setFocus).toHaveBeenCalledWith('startDate')
      expect(sdkForm.formMethods.setFocus).not.toHaveBeenCalled()
    })

    it('prefers focusing the earliest invalid slot across mixed form types', async () => {
      const rawForm = createMockRawForm({
        isValid: false,
        errorFields: ['startDate'],
      })
      const sdkForm = createMockForm({
        isValid: false,
        errorFields: ['firstName'],
      })
      const onAllValid = vi.fn()

      const { handleSubmit } = composeSubmitHandler([rawForm, sdkForm], onAllValid)
      await handleSubmit(createMockEvent())

      expect(onAllValid).not.toHaveBeenCalled()
      expect(rawForm.setFocus).toHaveBeenCalledWith('startDate')
      expect(sdkForm.formMethods.setFocus).not.toHaveBeenCalled()
    })

    it('does not include raw forms in aggregated errorHandling', () => {
      const sdkError = createMockError('SDK hook error')
      const sdkForm = createMockForm({
        errorHandling: createMockErrorHandling({ errors: [sdkError] }),
      })
      const rawForm = createMockRawForm()

      const { errorHandling } = composeSubmitHandler([sdkForm, rawForm], vi.fn())

      expect(errorHandling.errors.map(e => e.message)).toEqual(['SDK hook error'])
    })

    it('retryQueries and clearSubmitError skip raw forms (no synthesized errorHandling)', () => {
      const sdkForm = createMockForm()
      const rawForm = createMockRawForm()

      const { errorHandling } = composeSubmitHandler([sdkForm, rawForm], vi.fn())

      errorHandling.retryQueries()
      errorHandling.clearSubmitError()

      expect(sdkForm.errorHandling.retryQueries).toHaveBeenCalledOnce()
      expect(sdkForm.errorHandling.clearSubmitError).toHaveBeenCalledOnce()
    })
  })
})
