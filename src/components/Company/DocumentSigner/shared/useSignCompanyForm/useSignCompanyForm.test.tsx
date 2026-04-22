import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useSignCompanyForm } from './useSignCompanyForm'
import type { UseSignCompanyFormResult } from './useSignCompanyForm'
import { createSignCompanyFormSchema, SignCompanyFormErrorCodes } from './signCompanyFormSchema'
import { server } from '@/test/mocks/server'
import {
  handleGetCompanyForm,
  handleGetCompanyFormPdf,
  handleSignCompanyForm,
} from '@/test/mocks/apis/company_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { fieldsMetadataEntry } from '@/test/fieldsMetadata'

type ReadyResult = Extract<UseSignCompanyFormResult, { isLoading: false }>

function assertReady(hookResult: UseSignCompanyFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const VALID_FORM_DATA = {
  signature: 'John Doe',
  confirmSignature: true,
}

function getFieldErrors(
  result: ReturnType<ReturnType<typeof createSignCompanyFormSchema>[0]['safeParse']>,
) {
  if (result.success) return {}
  const errors: Record<string, string[]> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) errors[path] = []
    errors[path].push(issue.message)
  }
  return errors
}

describe('createSignCompanyFormSchema error codes', () => {
  it('produces REQUIRED for empty signature', () => {
    const [schema] = createSignCompanyFormSchema()
    const result = schema.safeParse({ ...VALID_FORM_DATA, signature: '' })
    const errors = getFieldErrors(result)

    expect(errors.signature).toContain(SignCompanyFormErrorCodes.REQUIRED)
  })

  it('produces REQUIRED for unchecked confirmSignature', () => {
    const [schema] = createSignCompanyFormSchema()
    const result = schema.safeParse({ ...VALID_FORM_DATA, confirmSignature: false })
    const errors = getFieldErrors(result)

    expect(errors.confirmSignature).toContain(SignCompanyFormErrorCodes.REQUIRED)
  })

  it('passes with valid data', () => {
    const [schema] = createSignCompanyFormSchema()
    const result = schema.safeParse(VALID_FORM_DATA)

    expect(result.success).toBe(true)
  })

  it('reports errors for both fields when both are invalid', () => {
    const [schema] = createSignCompanyFormSchema()
    const result = schema.safeParse({ signature: '', confirmSignature: false })
    const errors = getFieldErrors(result)

    expect(errors.signature).toContain(SignCompanyFormErrorCodes.REQUIRED)
    expect(errors.confirmSignature).toContain(SignCompanyFormErrorCodes.REQUIRED)
  })
})

describe('createSignCompanyFormSchema metadata', () => {
  it('marks both fields as required', () => {
    const [, { getFieldsMetadata }] = createSignCompanyFormSchema()
    const metadata = getFieldsMetadata()

    expect(metadata.signature.isRequired).toBe(true)
    expect(metadata.confirmSignature.isRequired).toBe(true)
  })
})

describe('useSignCompanyForm', () => {
  let signRequestBody: Record<string, unknown> | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    signRequestBody = null
    setupApiTestMocks()
  })

  it('returns loading state initially then transitions to ready', async () => {
    const { result } = renderHook(() => useSignCompanyForm({ formId: 'form-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    expect(readyResult.data.companyForm).toBeDefined()
    expect(readyResult.data.pdfUrl).toBeDefined()
    expect(readyResult.form.Fields.Signature).toBeDefined()
    expect(readyResult.form.Fields.ConfirmSignature).toBeDefined()
    expect(readyResult.status.isPending).toBe(false)
  })

  it('signs a company form with valid data', async () => {
    const signedForm = {
      uuid: 'form-123',
      name: 'Test Form',
      status: 'signed',
      form_type: 'company',
      created_at: '2024-05-29T12:00:00Z',
      updated_at: '2024-05-29T13:00:00Z',
      requires_signing: false,
    }

    server.use(
      handleSignCompanyForm(async ({ request }) => {
        signRequestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(signedForm)
      }),
    )

    const { result } = renderHook(
      () =>
        useSignCompanyForm({
          formId: 'form-123',
          defaultValues: {
            signature: 'John Doe',
            confirmSignature: true,
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    const submitResult = await act(async () => {
      return readyResult.actions.onSubmit()
    })

    expect(signRequestBody).not.toBeNull()
    expect(signRequestBody?.signature_text).toBe('John Doe')
    expect(signRequestBody?.agree).toBe(true)
    expect(signRequestBody?.signed_by_ip_address).toBe('')
    expect(submitResult).toBeDefined()
    expect(submitResult?.mode).toBe('create')
    expect(submitResult?.data).toEqual(expect.objectContaining({ uuid: 'form-123' }))
  })

  it('blocks submission when signature is empty', async () => {
    server.use(
      handleSignCompanyForm(async ({ request }) => {
        signRequestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ form: {} })
      }),
    )

    const { result } = renderHook(
      () =>
        useSignCompanyForm({
          formId: 'form-123',
          defaultValues: {
            signature: '',
            confirmSignature: true,
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    const submitResult = await act(async () => {
      return readyResult.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(signRequestBody).toBeNull()
  })

  it('blocks submission when confirmSignature is unchecked', async () => {
    server.use(
      handleSignCompanyForm(async ({ request }) => {
        signRequestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ form: {} })
      }),
    )

    const { result } = renderHook(
      () =>
        useSignCompanyForm({
          formId: 'form-123',
          defaultValues: {
            signature: 'John Doe',
            confirmSignature: false,
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    const submitResult = await act(async () => {
      return readyResult.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(signRequestBody).toBeNull()
  })

  it('exposes fieldsMetadata with correct required flags', async () => {
    const { result } = renderHook(() => useSignCompanyForm({ formId: 'form-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    expect(fieldsMetadataEntry(readyResult.form.fieldsMetadata, 'signature').isRequired).toBe(true)
    expect(
      fieldsMetadataEntry(readyResult.form.fieldsMetadata, 'confirmSignature').isRequired,
    ).toBe(true)
  })

  it('provides errorHandling in loading state', () => {
    server.use(
      handleGetCompanyForm(
        () => new Promise(() => {}), // never resolves
      ),
      handleGetCompanyFormPdf(() => new Promise(() => {})),
    )

    const { result } = renderHook(() => useSignCompanyForm({ formId: 'form-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling).toBeDefined()
  })
})
