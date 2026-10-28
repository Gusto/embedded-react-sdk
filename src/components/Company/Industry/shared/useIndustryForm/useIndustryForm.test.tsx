import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useIndustryForm } from './useIndustryForm'
import type { UseIndustryFormResult } from './useIndustryForm'
import { IndustryErrorCodes, createIndustrySchema } from './industrySchema'
import { server } from '@/test/mocks/server'
import {
  buildIndustrySelectionBody,
  handleGetIndustrySelection,
  handleUpdateIndustrySelection,
} from '@/test/mocks/apis/company'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { fieldsMetadataEntry } from '@/test/fieldsMetadata'
import type { FieldMetadataWithOptions } from '@/partner-hook-utils/types'
import type { NaicsCode } from '@/models/NAICSCodes'

const COMPANY_ID = 'company-uuid-123'

// A four-digit NAICS industry group. Valid for the API, absent from the bundled
// six-digit list, and the exact case SDK-1367 is about.
const FOUR_DIGIT = { code: '5416', title: 'Business & Technical Consulting Firms' }
const FIVE_DIGIT = { code: '54161', title: 'Management Consulting Services' }
// Present in src/models/NAICSValues.ts.
const SIX_DIGIT = { code: '541511', title: 'Custom Computer Programming Services' }

type ReadyResult = Extract<UseIndustryFormResult, { isLoading: false }>

function assertReady(hookResult: UseIndustryFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

function industryOptions(result: ReadyResult) {
  const entry = fieldsMetadataEntry(result.form.fieldsMetadata, 'naicsCode')
  return entry as FieldMetadataWithOptions<NaicsCode>
}

function mockSavedIndustry(naicsCode: string, title: string | null) {
  let updateBody: Record<string, unknown> | null = null

  const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
    updateBody = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      buildIndustrySelectionBody({
        naicsCode: String(updateBody.naics_code),
        title: (updateBody.title as string | undefined) ?? title,
      }),
      { status: 201 },
    )
  })

  server.use(
    handleGetIndustrySelection(() =>
      HttpResponse.json(buildIndustrySelectionBody({ naicsCode, title })),
    ),
    handleUpdateIndustrySelection(updateResolver),
  )

  return { updateResolver, getUpdateBody: () => updateBody }
}

async function renderReady() {
  const { result } = renderHook(() => useIndustryForm({ companyId: COMPANY_ID }), {
    wrapper: GustoTestProvider,
  })

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  return result
}

describe('createIndustrySchema', () => {
  it('requires naicsCode', () => {
    const [schema] = createIndustrySchema({ mode: 'update' })
    const result = schema.safeParse({ naicsCode: '' })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.message).toBe(IndustryErrorCodes.REQUIRED)
  })

  it('accepts a four-digit code, so a saved shorter classification can be resubmitted', () => {
    const [schema] = createIndustrySchema({ mode: 'update' })

    expect(schema.safeParse({ naicsCode: FOUR_DIGIT.code }).success).toBe(true)
  })
})

describe('useIndustryForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('exposes the bundled six-digit list and selects a saved six-digit code', async () => {
    mockSavedIndustry(SIX_DIGIT.code, SIX_DIGIT.title)

    const result = await renderReady()
    assertReady(result.current)

    const { options, entries } = industryOptions(result.current)
    expect(options).toHaveLength(1012)
    expect(entries).toContainEqual(SIX_DIGIT)
    expect(result.current.status).toMatchObject({ mode: 'update', isPending: false })
    expect(result.current.data.industry).toMatchObject({ naicsCode: SIX_DIGIT.code })
  })

  it.each([
    ['four-digit', FOUR_DIGIT],
    ['five-digit', FIVE_DIGIT],
  ])('adds an option titled from the API for a saved %s code', async (_label, saved) => {
    mockSavedIndustry(saved.code, saved.title)

    const result = await renderReady()
    assertReady(result.current)

    const { options, entries } = industryOptions(result.current)
    expect(options[0]).toEqual({ value: saved.code, label: saved.title })
    expect(entries?.[0]).toEqual(saved)
    expect(options).toHaveLength(1013)
  })

  it('labels a saved unlisted code with the code itself when the API returns no title', async () => {
    mockSavedIndustry(FOUR_DIGIT.code, null)

    const result = await renderReady()
    assertReady(result.current)

    const { options, entries } = industryOptions(result.current)
    // An empty title is the signal the view uses to substitute its own copy.
    expect(options[0]).toEqual({ value: FOUR_DIGIT.code, label: FOUR_DIGIT.code })
    expect(entries?.[0]).toEqual({ code: FOUR_DIGIT.code, title: '' })
  })

  it('preserves a saved four-digit code and its title on an unchanged submit', async () => {
    const { updateResolver, getUpdateBody } = mockSavedIndustry(FOUR_DIGIT.code, FOUR_DIGIT.title)

    const result = await renderReady()
    assertReady(result.current)

    let submitted
    await act(async () => {
      assertReady(result.current)
      submitted = await result.current.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    // The title rides along because the API derives a missing one from an
    // external lookup that does not resolve reliably for shorter codes.
    expect(getUpdateBody()).toMatchObject({
      naics_code: FOUR_DIGIT.code,
      title: FOUR_DIGIT.title,
    })
    expect(submitted).toMatchObject({ mode: 'update', data: { naicsCode: FOUR_DIGIT.code } })
  })

  it('replaces a saved four-digit code with a listed six-digit option', async () => {
    const { updateResolver, getUpdateBody } = mockSavedIndustry(FOUR_DIGIT.code, FOUR_DIGIT.title)

    const result = await renderReady()
    assertReady(result.current)

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('naicsCode', SIX_DIGIT.code)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    // Only the code -- no stale title carried over from the replaced classification.
    expect(getUpdateBody()).toEqual({ naics_code: SIX_DIGIT.code })
  })

  it('surfaces a failed industry query through errorHandling', async () => {
    server.use(handleGetIndustrySelection(() => new HttpResponse(null, { status: 500 })))

    const { result } = renderHook(() => useIndustryForm({ companyId: COMPANY_ID }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
    // The form still becomes usable: the code list is bundled, so a failed lookup
    // of the current classification leaves an unclassified-but-selectable form
    // alongside the surfaced error rather than an indefinite spinner.
    expect(result.current.isLoading).toBe(false)
  })
})
