import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useEmployeeDetailsForm } from './useEmployeeDetailsForm'
import type { UseEmployeeDetailsFormResult } from './useEmployeeDetailsForm'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployee,
  handleCreateEmployee,
  handleUpdateEmployee,
  handleUpdateEmployeeOnboardingStatus,
} from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

type ReadyResult = Extract<UseEmployeeDetailsFormResult, { isLoading: false }>

function assertReady(hookResult: UseEmployeeDetailsFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('useEmployeeDetailsForm', () => {
  let createRequestBody: Record<string, unknown> | null = null
  let updateRequestBody: Record<string, unknown> | null = null
  let onboardingStatusRequestBody: Record<string, unknown> | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    createRequestBody = null
    updateRequestBody = null
    onboardingStatusRequestBody = null
    setupApiTestMocks()
  })

  describe('create mode', () => {
    beforeEach(() => {
      server.use(
        handleCreateEmployee(async ({ request }) => {
          createRequestBody = (await request.json()) as Record<string, unknown>
          const responseFixture = await getFixture('get-v1-employees')
          return HttpResponse.json(responseFixture, { status: 201 })
        }),
      )
    })

    it('returns ready state with create mode when no employeeId is provided', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.status.mode).toBe('create')
      expect(readyResult.data.employee).toBeNull()
      expect(readyResult.form.Fields.FirstName).toBeDefined()
      expect(readyResult.form.Fields.LastName).toBeDefined()
      expect(readyResult.form.Fields.Email).toBeDefined()
      expect(readyResult.form.Fields.SelfOnboarding).toBeDefined()
    })

    it('creates an employee with required fields', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            defaultValues: {
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(result.current.errorHandling.errors).toHaveLength(0)
      expect(createRequestBody).not.toBeNull()
      expect(createRequestBody?.first_name).toBe('Jane')
      expect(createRequestBody?.last_name).toBe('Doe')
      expect(createRequestBody?.email).toBe('jane@example.com')
    })

    it('creates an employee with selfOnboarding enabled', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            defaultValues: {
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              selfOnboarding: true,
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).not.toBeNull()
      expect(createRequestBody?.self_onboarding).toBe(true)
    })

    it('shows validation error when first name is empty', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            defaultValues: {
              firstName: '',
              lastName: 'Doe',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).toBeNull()
    })

    it('rejects submission when requiredFields email is required but empty', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            requiredFields: { create: ['email'] },
            defaultValues: {
              firstName: 'Jane',
              lastName: 'Doe',
              email: '',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).toBeNull()
    })

    it('accepts submission when requiredFields email is required and provided', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            requiredFields: { create: ['email'] },
            defaultValues: {
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).not.toBeNull()
      expect(createRequestBody?.email).toBe('jane@example.com')
    })

    it('sets isRequired in fieldsMetadata for required fields', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            requiredFields: { create: ['email', 'ssn'] },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.fieldsMetadata.email.isRequired).toBe(true)
      expect(readyResult.form.fieldsMetadata.ssn.isRequired).toBe(true)
      expect(readyResult.form.fieldsMetadata.dateOfBirth.isRequired).toBe(false)
    })

    it('always includes API-required fields on create', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            requiredFields: { create: ['email'] },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.fieldsMetadata.firstName.isRequired).toBe(true)
      expect(readyResult.form.fieldsMetadata.lastName.isRequired).toBe(true)
      expect(readyResult.form.fieldsMetadata.email.isRequired).toBe(true)
    })
  })

  describe('update mode', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployee(async () => {
          const fixture = await getFixture('get-v1-employees')
          return HttpResponse.json({
            ...fixture,
            onboarding_status: 'admin_onboarding_incomplete',
            onboarded: false,
          })
        }),
        handleUpdateEmployee(async ({ request }) => {
          updateRequestBody = (await request.json()) as Record<string, unknown>
          const fixture = await getFixture('get-v1-employees')
          return HttpResponse.json({ ...fixture, ...updateRequestBody })
        }),
        handleUpdateEmployeeOnboardingStatus(async ({ request }) => {
          onboardingStatusRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({
            uuid: 'emp-1',
            onboarding_status: onboardingStatusRequestBody.onboarding_status,
          })
        }),
      )
    })

    it('returns ready state with update mode when employeeId is provided', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            employeeId: 'emp-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.status.mode).toBe('update')
      expect(readyResult.data.employee).not.toBeNull()
    })

    it('updates an employee and sends version', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            employeeId: 'emp-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(updateRequestBody).not.toBeNull()
      expect(updateRequestBody?.version).toBeDefined()
    })

    it('triggers onboarding status update when selfOnboarding changes', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            employeeId: 'emp-1',
            defaultValues: {
              selfOnboarding: true,
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(onboardingStatusRequestBody).not.toBeNull()
      expect(onboardingStatusRequestBody?.onboarding_status).toBe('self_onboarding_pending_invite')
    })

    it('uses update requiredFields in update mode without create defaults', async () => {
      const { result } = renderHook(
        () =>
          useEmployeeDetailsForm({
            companyId: 'company-1',
            employeeId: 'emp-1',
            requiredFields: {
              create: ['email'],
              update: ['ssn'],
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.fieldsMetadata.email.isRequired).toBe(false)
      expect(readyResult.form.fieldsMetadata.ssn.isRequired).toBe(true)
      expect(readyResult.form.fieldsMetadata.firstName.isRequired).toBe(false)
    })
  })
})
