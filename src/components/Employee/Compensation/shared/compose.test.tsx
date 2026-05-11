import type { SyntheticEvent } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useJobForm } from './useJobForm/useJobForm'
import { useCompensationForm } from './useCompensationForm/useCompensationForm'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeJobs,
  handleCreateEmployeeJob,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { FlsaStatus, PAY_PERIODS } from '@/shared/constants'

describe('composeSubmitHandler([useJobForm, useCompensationForm])', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  function makeMockEvent(): SyntheticEvent {
    return { preventDefault: () => {} } as SyntheticEvent
  }

  it('onboarding chain: validates both, POSTs job, then PUTs the stub compensation with the new jobId/compensationId', async () => {
    let putCompensationBody: Record<string, unknown> | null = null
    const createJobResolver = vi.fn(() =>
      HttpResponse.json(
        {
          uuid: 'newly-created-job-uuid',
          version: 'v1',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'newly-created-compensation-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: 'Engineer',
          hire_date: '2025-01-15',
          two_percent_shareholder: false,
          state_wc_covered: false,
          state_wc_class_code: null,
          compensations: [
            {
              uuid: 'newly-created-compensation-uuid',
              version: 'comp-v1',
              job_uuid: 'newly-created-job-uuid',
              rate: '0',
              payment_unit: 'Hour',
              flsa_status: 'Nonexempt',
              effective_date: '2025-01-15',
              adjust_for_minimum_wage: false,
            },
          ],
          rate: '0',
        },
        { status: 201 },
      ),
    )
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      putCompensationBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'newly-created-compensation-uuid',
        version: 'comp-v2',
        job_uuid: 'newly-created-job-uuid',
        rate: putCompensationBody.rate,
        payment_unit: putCompensationBody.payment_unit ?? 'Hour',
        flsa_status: putCompensationBody.flsa_status ?? 'Nonexempt',
        effective_date: putCompensationBody.effective_date ?? '2025-01-15',
        adjust_for_minimum_wage: false,
      })
    })

    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateEmployeeJob(createJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const { result } = renderHook(
      () => {
        const jobForm = useJobForm({
          employeeId: 'employee-uuid',
          defaultValues: { title: 'Engineer', hireDate: '2025-01-15' },
          shouldFocusError: false,
        })
        const compensationForm = useCompensationForm({
          employeeId: 'employee-uuid',
          defaultValues: {
            rate: 25,
            paymentUnit: PAY_PERIODS.HOUR,
            flsaStatus: FlsaStatus.NONEXEMPT,
            effectiveDate: '2025-01-15',
          },
          shouldFocusError: false,
        })
        return { jobForm, compensationForm }
      },
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.jobForm.isLoading).toBe(false)
      expect(result.current.compensationForm.isLoading).toBe(false)
    })

    if (result.current.jobForm.isLoading || result.current.compensationForm.isLoading) {
      throw new Error('expected both hooks ready')
    }

    const { handleSubmit } = composeSubmitHandler(
      [result.current.jobForm, result.current.compensationForm],
      async () => {
        if (result.current.jobForm.isLoading || result.current.compensationForm.isLoading) return
        const created = await result.current.jobForm.actions.onSubmit()
        if (!created || created.mode !== 'create') return
        const newJobId = created.data.uuid
        const newCompensationId = created.data.currentCompensationUuid
        const newCompensation = created.data.compensations?.find(c => c.uuid === newCompensationId)
        await result.current.compensationForm.actions.onSubmit({
          jobId: newJobId,
          compensationId: newCompensationId,
          compensationVersion: newCompensation?.version as string,
        })
      },
    )

    await act(async () => {
      await handleSubmit(makeMockEvent())
    })

    expect(createJobResolver).toHaveBeenCalledTimes(1)
    expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    expect(createJobResolver.mock.invocationCallOrder[0]).toBeLessThan(
      updateCompensationResolver.mock.invocationCallOrder[0]!,
    )
    expect(putCompensationBody).toMatchObject({
      version: 'comp-v1',
      rate: '25',
    })
  })

  it('gating: when compensation form is invalid, the job is NOT posted', async () => {
    const createJobResolver = vi.fn(() =>
      HttpResponse.json(
        {
          uuid: 'should-not-be-created',
          version: 'v1',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'should-not-be-created-comp',
          payment_unit: 'Hour',
          primary: true,
          title: 'Engineer',
          hire_date: '2025-01-15',
          two_percent_shareholder: false,
          state_wc_covered: false,
          state_wc_class_code: null,
          compensations: [],
          rate: '0',
        },
        { status: 201 },
      ),
    )

    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateEmployeeJob(createJobResolver),
    )

    const { result } = renderHook(
      () => {
        const jobForm = useJobForm({
          employeeId: 'employee-uuid',
          defaultValues: { title: 'Engineer', hireDate: '2025-01-15' },
          shouldFocusError: false,
        })
        const compensationForm = useCompensationForm({
          employeeId: 'employee-uuid',
          defaultValues: {
            rate: 0,
            paymentUnit: PAY_PERIODS.HOUR,
            flsaStatus: FlsaStatus.NONEXEMPT,
            effectiveDate: '2025-01-15',
          },
          shouldFocusError: false,
        })
        return { jobForm, compensationForm }
      },
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.jobForm.isLoading).toBe(false)
      expect(result.current.compensationForm.isLoading).toBe(false)
    })

    if (result.current.jobForm.isLoading || result.current.compensationForm.isLoading) {
      throw new Error('expected both hooks ready')
    }

    const onAllValid = vi.fn()
    const { handleSubmit } = composeSubmitHandler(
      [result.current.jobForm, result.current.compensationForm],
      onAllValid,
    )

    await act(async () => {
      await handleSubmit(makeMockEvent())
    })

    expect(onAllValid).not.toHaveBeenCalled()
    expect(createJobResolver).not.toHaveBeenCalled()
  })

  it('gating: when jobForm is invalid, compensationForm submit does not run inside onAllValid', async () => {
    const createJobResolver = vi.fn(() => HttpResponse.json({}, { status: 201 }))

    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateEmployeeJob(createJobResolver),
    )

    const { result } = renderHook(
      () => {
        const jobForm = useJobForm({
          employeeId: 'employee-uuid',
          defaultValues: { title: '', hireDate: null },
          shouldFocusError: false,
        })
        const compensationForm = useCompensationForm({
          employeeId: 'employee-uuid',
          defaultValues: {
            rate: 25,
            paymentUnit: PAY_PERIODS.HOUR,
            flsaStatus: FlsaStatus.NONEXEMPT,
            effectiveDate: '2025-01-15',
          },
          shouldFocusError: false,
        })
        return { jobForm, compensationForm }
      },
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.jobForm.isLoading).toBe(false)
      expect(result.current.compensationForm.isLoading).toBe(false)
    })

    if (result.current.jobForm.isLoading || result.current.compensationForm.isLoading) {
      throw new Error('expected both hooks ready')
    }

    const onAllValid = vi.fn()
    const { handleSubmit } = composeSubmitHandler(
      [result.current.jobForm, result.current.compensationForm],
      onAllValid,
    )

    await act(async () => {
      await handleSubmit(makeMockEvent())
    })

    expect(onAllValid).not.toHaveBeenCalled()
    expect(createJobResolver).not.toHaveBeenCalled()
  })

  it('aggregated errorHandling exposes errors from both hooks via composeErrorHandler', async () => {
    server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))

    const { result } = renderHook(
      () => {
        const jobForm = useJobForm({
          employeeId: 'employee-uuid',
          shouldFocusError: false,
        })
        const compensationForm = useCompensationForm({
          employeeId: 'employee-uuid',
          shouldFocusError: false,
        })
        return { jobForm, compensationForm }
      },
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.jobForm.isLoading).toBe(false)
      expect(result.current.compensationForm.isLoading).toBe(false)
    })

    if (result.current.jobForm.isLoading || result.current.compensationForm.isLoading) {
      throw new Error('expected both hooks ready')
    }

    const { errorHandling } = composeSubmitHandler(
      [result.current.jobForm, result.current.compensationForm],
      vi.fn(),
    )

    expect(errorHandling.errors).toEqual([])
    expect(typeof errorHandling.retryQueries).toBe('function')
  })
})
