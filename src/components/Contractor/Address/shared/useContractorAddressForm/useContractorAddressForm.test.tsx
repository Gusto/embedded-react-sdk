import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useContractorAddressForm } from './useContractorAddressForm'
import type {
  UseContractorAddressFormResult,
  ContractorAddressOptionalFieldsToRequire,
} from './useContractorAddressForm'
import {
  ContractorAddressErrorCodes,
  createContractorAddressSchema,
} from './contractorAddressSchema'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
  handleGetContractorAddress,
  handleUpdateContractorAddress,
} from '@/test/mocks/apis/contractor_address'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

type ReadyResult = Extract<UseContractorAddressFormResult, { isLoading: false }>

function assertReady(
  hookResult: UseContractorAddressFormResult,
): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const fullAddressResponse = {
  version: 'contractor-address-version',
  contractor_uuid: 'contractor_id',
  street_1: '999 Kiera Stravenue',
  street_2: 'Suite 541',
  city: 'San Francisco',
  state: 'CA',
  zip: '94107',
  country: 'USA',
  active: true,
}

const emptyAddressResponse = {
  version: 'contractor-address-version',
  street_1: null,
  street_2: null,
  city: null,
  state: null,
  zip: null,
  country: 'USA',
}

const updatedAddressResponse = {
  version: 'contractor-address-version-updated',
  country: 'USA',
  street_1: '123 Main St',
  street_2: 'Apt 4B',
  city: 'Denver',
  state: 'CO',
  zip: '80202',
}

const VALID_FORM_DATA = {
  street1: '123 Main St',
  street2: '',
  city: 'Denver',
  state: 'CO',
  zip: '80202',
}

const REQUIRE_ALL: ContractorAddressOptionalFieldsToRequire = {
  update: ['street1', 'city', 'state', 'zip'],
}

describe('createContractorAddressSchema', () => {
  it('treats every address field as optional by default (matching the API)', () => {
    const [schema] = createContractorAddressSchema()
    const result = schema.safeParse({ street1: '', street2: '', city: '', state: '', zip: '' })
    expect(result.success).toBe(true)
  })

  it('reports every address field as optional in metadata by default', () => {
    const [, { getFieldsMetadata }] = createContractorAddressSchema()
    const metadata = getFieldsMetadata()
    expect(metadata.street1.isRequired).toBe(false)
    expect(metadata.street2.isRequired).toBe(false)
    expect(metadata.city.isRequired).toBe(false)
    expect(metadata.state.isRequired).toBe(false)
    expect(metadata.zip.isRequired).toBe(false)
  })

  it('promotes fields to required via optionalFieldsToRequire', () => {
    const [schema] = createContractorAddressSchema({ optionalFieldsToRequire: REQUIRE_ALL })
    const result = schema.safeParse({ street1: '', street2: '', city: '', state: '', zip: '' })

    expect(result.success).toBe(false)
    if (result.success) return

    const issuesByField = new Map(
      result.error.issues.map(issue => [String(issue.path[0]), issue.message]),
    )
    expect(issuesByField.get('street1')).toBe(ContractorAddressErrorCodes.REQUIRED)
    expect(issuesByField.get('city')).toBe(ContractorAddressErrorCodes.REQUIRED)
    expect(issuesByField.get('state')).toBe(ContractorAddressErrorCodes.REQUIRED)
    expect(issuesByField.get('zip')).toBe(ContractorAddressErrorCodes.REQUIRED)
  })

  it('reflects promoted fields as required in metadata', () => {
    const [, { getFieldsMetadata }] = createContractorAddressSchema({
      optionalFieldsToRequire: REQUIRE_ALL,
    })
    const metadata = getFieldsMetadata()
    expect(metadata.street1.isRequired).toBe(true)
    expect(metadata.city.isRequired).toBe(true)
    expect(metadata.state.isRequired).toBe(true)
    expect(metadata.zip.isRequired).toBe(true)
    expect(metadata.street2.isRequired).toBe(false)
  })

  it('emits INVALID_ZIP for a malformed zip regardless of requiredness', () => {
    const [schema] = createContractorAddressSchema()
    const result = schema.safeParse({ ...VALID_FORM_DATA, zip: 'not-a-zip' })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.find(issue => String(issue.path[0]) === 'zip')?.message).toBe(
      ContractorAddressErrorCodes.INVALID_ZIP,
    )
  })

  it('accepts both 5-digit and ZIP+4 formats', () => {
    const [schema] = createContractorAddressSchema()
    expect(schema.safeParse({ ...VALID_FORM_DATA, zip: '80202' }).success).toBe(true)
    expect(schema.safeParse({ ...VALID_FORM_DATA, zip: '80202-1234' }).success).toBe(true)
  })
})

describe('useContractorAddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  describe('loading and ready states', () => {
    beforeEach(() => {
      server.use(handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)))
    })

    it('transitions from loading to ready and exposes the loaded address', async () => {
      const { result } = renderHook(
        () => useContractorAddressForm({ contractorId: 'contractor_id' }),
        { wrapper: GustoTestProvider },
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const ready = result.current
      assertReady(ready)

      expect(ready.status.mode).toBe('update')
      expect(ready.data.contractorAddress).toMatchObject({
        version: 'contractor-address-version',
        street1: '999 Kiera Stravenue',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
      })
      expect(ready.form.Fields.Street1).toBeDefined()
      expect(ready.form.Fields.Street2).toBeDefined()
      expect(ready.form.Fields.City).toBeDefined()
      expect(ready.form.Fields.State).toBeDefined()
      expect(ready.form.Fields.Zip).toBeDefined()
    })

    it('exposes the contractor type for Individual contractors', async () => {
      const { result } = renderHook(
        () => useContractorAddressForm({ contractorId: 'contractor_id' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.data.contractorType).toBe('Individual')
    })

    it('exposes the contractor type for Business contractors', async () => {
      server.use(
        handleGetContractor(() =>
          HttpResponse.json({
            uuid: 'contractor_id',
            type: 'Business',
            is_active: true,
            file_new_hire_report: false,
          }),
        ),
      )

      const { result } = renderHook(
        () => useContractorAddressForm({ contractorId: 'contractor_id' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.data.contractorType).toBe('Business')
    })

    it('seeds the form from the loaded address values', async () => {
      const { result } = renderHook(
        () => useContractorAddressForm({ contractorId: 'contractor_id' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.getFormSubmissionValues()).toMatchObject({
        street1: '999 Kiera Stravenue',
        street2: 'Suite 541',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
      })
    })

    it('lets server values take precedence over partner default values', async () => {
      const { result } = renderHook(
        () =>
          useContractorAddressForm({
            contractorId: 'contractor_id',
            defaultValues: {
              street1: '111 Partner Way',
              city: 'Partnerville',
              state: 'NY',
              zip: '10001',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.getFormSubmissionValues()).toMatchObject({
        street1: '999 Kiera Stravenue',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
      })
    })
  })

  describe('partner default values when no address on file', () => {
    beforeEach(() => {
      server.use(handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)))
    })

    it('seeds the form from partner default values', async () => {
      const { result } = renderHook(
        () =>
          useContractorAddressForm({
            contractorId: 'contractor_id',
            defaultValues: {
              street1: '111 Partner Way',
              city: 'Partnerville',
              state: 'NY',
              zip: '10001',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.getFormSubmissionValues()).toMatchObject({
        street1: '111 Partner Way',
        city: 'Partnerville',
        state: 'NY',
        zip: '10001',
      })
    })
  })

  describe('validation', () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(updatedAddressResponse),
    )

    beforeEach(() => {
      updateResolver.mockClear()
      server.use(
        handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)),
        handleUpdateContractorAddress(updateResolver),
      )
    })

    it('submits an empty address by default since all fields are optional (API-aligned)', async () => {
      const { result } = renderHook(
        () => useContractorAddressForm({ contractorId: 'contractor_id' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      const ready = result.current

      let submitResult: unknown
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(submitResult).toEqual(expect.objectContaining({ mode: 'update' }))
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })

    it('blocks submission when fields are promoted to required via optionalFieldsToRequire', async () => {
      const { result } = renderHook(
        () =>
          useContractorAddressForm({
            contractorId: 'contractor_id',
            optionalFieldsToRequire: REQUIRE_ALL,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      const ready = result.current

      let submitResult: unknown
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(submitResult).toBeUndefined()
      expect(updateResolver).not.toHaveBeenCalled()
    })

    it('treats street2 as optional', async () => {
      const { result } = renderHook(
        () =>
          useContractorAddressForm({
            contractorId: 'contractor_id',
            defaultValues: {
              street1: '123 Main St',
              city: 'Denver',
              state: 'CO',
              zip: '80202',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      const ready = result.current

      let submitResult: unknown
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(submitResult).toEqual(expect.objectContaining({ mode: 'update' }))
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })

    it('emits INVALID_ZIP for a malformed zip and does not call the API', async () => {
      const { result } = renderHook(
        () =>
          useContractorAddressForm({
            contractorId: 'contractor_id',
            defaultValues: {
              street1: '123 Main St',
              city: 'Denver',
              state: 'CO',
              zip: 'not-a-zip',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      const ready = result.current

      let submitResult: unknown
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(submitResult).toBeUndefined()
      expect(updateResolver).not.toHaveBeenCalled()
    })
  })

  describe('update submission', () => {
    let updatePath: string | null = null
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updatePath = new URL(request.url).pathname
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(updatedAddressResponse)
    })

    beforeEach(() => {
      updatePath = null
      updateBody = null
      updateResolver.mockClear()
      server.use(
        handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)),
        handleUpdateContractorAddress(updateResolver),
      )
    })

    it('issues a single PUT carrying the version and field values, returning an update result', async () => {
      const { result } = renderHook(
        () =>
          useContractorAddressForm({
            contractorId: 'contractor_id',
            defaultValues: {
              street1: '123 Main St',
              street2: 'Apt 4B',
              city: 'Denver',
              state: 'CO',
              zip: '80202',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      const ready = result.current

      let submitResult: Awaited<ReturnType<ReadyResult['actions']['onSubmit']>>
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(updatePath).toBe('/v1/contractors/contractor_id/address')
      // Server values take precedence on update, so the loaded address is sent.
      expect(updateBody).toMatchObject({
        version: 'contractor-address-version',
        street_1: '999 Kiera Stravenue',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
      })

      expect(submitResult).toEqual(
        expect.objectContaining({
          mode: 'update',
          data: expect.objectContaining({ version: 'contractor-address-version-updated' }),
        }),
      )
    })
  })
})
