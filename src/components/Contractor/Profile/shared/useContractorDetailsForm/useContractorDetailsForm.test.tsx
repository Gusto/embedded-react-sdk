import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useContractorDetailsForm } from './useContractorDetailsForm'
import type { UseContractorDetailsFormResult } from './useContractorDetailsForm'
import { ContractorType, WageType } from './contractorDetailsSchema'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
  handleCreateContractor,
  handleUpdateContractor,
} from '@/test/mocks/apis/contractors'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { fieldsMetadataEntry } from '@/test/fieldsMetadata'

type ReadyResult = Extract<UseContractorDetailsFormResult, { isLoading: false }>

function assertReady(
  hookResult: UseContractorDetailsFormResult,
): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const renderForm = (props: Parameters<typeof useContractorDetailsForm>[0]) =>
  renderHook(() => useContractorDetailsForm(props), { wrapper: GustoTestProvider })

describe('useContractorDetailsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  describe('create mode', () => {
    it('returns ready state with create mode and individual + fixed defaults', async () => {
      const { result } = renderForm({ companyId: 'company-1' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const ready = result.current
      assertReady(ready)

      expect(ready.status.mode).toBe('create')
      expect(ready.data.contractor).toBeNull()
      expect(ready.form.Fields.Type).toBeDefined()
      expect(ready.form.Fields.WageType).toBeDefined()
      expect(ready.form.Fields.StartDate).toBeDefined()
      expect(ready.form.Fields.FirstName).toBeDefined()
      expect(ready.form.Fields.LastName).toBeDefined()
      expect(ready.form.Fields.Ssn).toBeDefined()
      expect(ready.form.Fields.SelfOnboarding).toBeDefined()
      expect(ready.form.Fields.HourlyRate).toBeUndefined()
      expect(ready.form.Fields.Email).toBeUndefined()
      expect(ready.form.Fields.BusinessName).toBeUndefined()
      expect(ready.form.Fields.Ein).toBeUndefined()
    })

    it('shows business fields and hides individual fields for a business contractor', async () => {
      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: { type: ContractorType.Business },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      expect(ready.form.Fields.BusinessName).toBeDefined()
      expect(ready.form.Fields.Ein).toBeDefined()
      expect(ready.form.Fields.FirstName).toBeUndefined()
      expect(ready.form.Fields.Ssn).toBeUndefined()
    })

    it('reveals email and hides ssn when self-onboarding is enabled', async () => {
      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: { type: ContractorType.Individual, selfOnboarding: true },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      expect(ready.form.Fields.Email).toBeDefined()
      expect(ready.form.Fields.Ssn).toBeUndefined()
    })

    it('reveals the hourly rate field when wageType is Hourly', async () => {
      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: { wageType: WageType.Hourly },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      expect(ready.form.Fields.HourlyRate).toBeDefined()
    })

    it('marks applicable individual fields required and leaves ssn optional by default', async () => {
      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: { type: ContractorType.Individual, wageType: WageType.Hourly },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      const meta = ready.form.fieldsMetadata
      expect(fieldsMetadataEntry(meta, 'firstName').isRequired).toBe(true)
      expect(fieldsMetadataEntry(meta, 'lastName').isRequired).toBe(true)
      expect(fieldsMetadataEntry(meta, 'hourlyRate').isRequired).toBe(true)
      // ssn is optional at the hook baseline (matches the API); consumers opt in
      // via optionalFieldsToRequire.
      expect(fieldsMetadataEntry(meta, 'ssn').isRequired).toBe(false)
      // business fields don't apply to an individual and are excluded entirely.
      expect(meta.businessName).toBeUndefined()
      expect(meta.ein).toBeUndefined()
    })

    it('promotes ssn to required in fieldsMetadata via optionalFieldsToRequire', async () => {
      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: { type: ContractorType.Individual },
        optionalFieldsToRequire: { create: ['ssn'] },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      expect(fieldsMetadataEntry(ready.form.fieldsMetadata, 'ssn').isRequired).toBe(true)
    })

    it('exposes type and workState options on fieldsMetadata', async () => {
      const { result } = renderForm({ companyId: 'company-1' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      const typeMeta = fieldsMetadataEntry(ready.form.fieldsMetadata, 'type')
      expect(typeMeta).toMatchObject({
        options: [
          { value: ContractorType.Individual, label: ContractorType.Individual },
          { value: ContractorType.Business, label: ContractorType.Business },
        ],
      })
    })

    it('creates an individual contractor with digits-only SSN and is_active', async () => {
      let body: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { uuid: 'new-uuid', type: 'Individual', is_active: true },
          { status: 201 },
        )
      })
      server.use(handleCreateContractor(createResolver))

      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: {
          type: ContractorType.Individual,
          wageType: WageType.Fixed,
          firstName: 'Jane',
          lastName: 'Doe',
          ssn: '123-45-6789',
        },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      let submitResult: Awaited<ReturnType<typeof ready.actions.onSubmit>>
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(submitResult).toMatchObject({ mode: 'create', data: { uuid: 'new-uuid' } })
      expect(body).toMatchObject({
        type: 'Individual',
        first_name: 'Jane',
        last_name: 'Doe',
        ssn: '123456789',
        self_onboarding: false,
        file_new_hire_report: false,
        is_active: true,
      })
    })

    it('creates a business contractor with digits-only EIN', async () => {
      let body: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { uuid: 'new-uuid', type: 'Business', is_active: true },
          { status: 201 },
        )
      })
      server.use(handleCreateContractor(createResolver))

      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: {
          type: ContractorType.Business,
          wageType: WageType.Fixed,
          businessName: 'Acme LLC',
          ein: '12-3456789',
        },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      await act(async () => {
        await ready.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(body).toMatchObject({
        type: 'Business',
        business_name: 'Acme LLC',
        ein: '123456789',
        self_onboarding: false,
      })
    })

    it('omits ssn and sends email when self-onboarding is enabled', async () => {
      let body: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ uuid: 'new-uuid', is_active: true }, { status: 201 })
      })
      server.use(handleCreateContractor(createResolver))

      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: {
          type: ContractorType.Individual,
          wageType: WageType.Fixed,
          selfOnboarding: true,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          ssn: '123-45-6789',
        },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      await act(async () => {
        await ready.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(body).toMatchObject({
        self_onboarding: true,
        email: 'jane@example.com',
      })
      expect(body).not.toHaveProperty('ssn')
    })

    it('does not call the mutation when validation fails', async () => {
      const createResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ uuid: 'x' }, { status: 201 }),
      )
      server.use(handleCreateContractor(createResolver))

      const { result } = renderForm({
        companyId: 'company-1',
        defaultValues: { type: ContractorType.Individual, firstName: '', lastName: '' },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      let submitResult: Awaited<ReturnType<typeof ready.actions.onSubmit>>
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(submitResult).toBeUndefined()
      expect(createResolver).not.toHaveBeenCalled()
    })
  })

  describe('update mode', () => {
    const existingContractor = {
      uuid: 'contractor_id',
      version: 'version-1',
      type: 'Individual',
      wage_type: 'Fixed',
      start_date: '2024-01-01',
      first_name: 'John',
      last_name: 'Doe',
      has_ssn: true,
      has_ein: false,
      is_active: true,
      file_new_hire_report: false,
      onboarding_status: 'admin_onboarding_incomplete',
    }

    beforeEach(() => {
      server.use(handleGetContractor(() => HttpResponse.json(existingContractor)))
    })

    it('loads the contractor and waives the SSN requirement when one is on file', async () => {
      const { result } = renderForm({ contractorId: 'contractor_id' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      expect(ready.status.mode).toBe('update')
      expect(ready.data.contractor?.uuid).toBe('contractor_id')

      const ssnMeta = fieldsMetadataEntry(ready.form.fieldsMetadata, 'ssn')
      expect(ssnMeta.hasRedactedValue).toBe(true)
    })

    it('submits without a re-entered SSN when one is already on file', async () => {
      let body: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...existingContractor, version: 'version-2' })
      })
      server.use(handleUpdateContractor(updateResolver))

      const { result } = renderForm({ contractorId: 'contractor_id' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      await act(async () => {
        await ready.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(body).not.toHaveProperty('ssn')
    })

    it('updates the contractor with a version and no is_active', async () => {
      let body: Record<string, unknown> | null = null
      let path: string | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        path = new URL(request.url).pathname
        return HttpResponse.json({ ...existingContractor, version: 'version-2' })
      })
      server.use(handleUpdateContractor(updateResolver))

      const { result } = renderForm({ contractorId: 'contractor_id' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      let submitResult: Awaited<ReturnType<typeof ready.actions.onSubmit>>
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(submitResult).toMatchObject({ mode: 'update' })
      expect(path).toBe('/v1/contractors/contractor_id')
      expect(body).toMatchObject({ version: 'version-1', type: 'Individual' })
      expect(body).not.toHaveProperty('is_active')
    })

    it('hides the self-onboarding toggle once the contractor is already self-onboarding', async () => {
      server.use(
        handleGetContractor(() =>
          HttpResponse.json({
            ...existingContractor,
            onboarding_status: 'self_onboarding_invited',
          }),
        ),
      )

      const { result } = renderForm({ contractorId: 'contractor_id' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      const ready = result.current
      assertReady(ready)

      expect(ready.form.Fields.SelfOnboarding).toBeUndefined()
    })
  })
})
