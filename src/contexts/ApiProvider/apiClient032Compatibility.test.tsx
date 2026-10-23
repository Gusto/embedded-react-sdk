import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsList } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { usePaySchedulesGetAll } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsGetReceipt } from '@gusto/embedded-api/react-query/payrollsGetReceipt'
import { API_VERSION } from './apiVersion'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'
import { server } from '@/test/mocks/server'
import { getTotalPtoHours } from '@/components/Payroll/helpers'

const employeeResponse = {
  uuid: 'employee-032',
  first_name: 'Alex',
  last_name: 'Rivera',
  payment_method: 'Direct Deposit',
  version: 'employee-v1',
}
const contractorResponse = {
  uuid: 'contractor-032',
  type: 'Individual',
  first_name: 'Sam',
  last_name: 'Lee',
  is_active: true,
  version: 'contractor-v1',
  onboarding_status: 'onboarding_completed',
}
const draftCompensation = {
  employee_uuid: 'employee-032',
  version: 'payroll-employee-v1',
  hourly_compensations: [
    {
      name: 'Regular Hours',
      job_uuid: 'job-032',
      hours: '40',
      breakdowns: [{ start_date: '2026-10-05', end_date: '2026-10-11', hours: '40' }],
    },
  ],
  fixed_compensations: [
    {
      name: 'Bonus',
      amount: '125',
      breakdowns: [{ start_date: '2026-10-05', end_date: '2026-10-11', amount: '125' }],
    },
  ],
  paid_time_off: [
    { name: 'Vacation Hours', hours: '0', approved_request_hours: '8.5' },
    { name: 'Sick Hours', hours: '0', approved_request_hours: '0.0' },
    { name: 'Holiday Hours', hours: '8', approved_request_hours: null },
  ],
}

describe('API client 0.3.2 compatibility through ApiProvider', () => {
  it('reads employeeShow, keeps the employee mutation response, and refetches after saving', async () => {
    let firstName = 'Alex'
    const getResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      expect(request.headers.get('X-Gusto-API-Version')).toBe(API_VERSION)
      return HttpResponse.json({
        ...employeeResponse,
        first_name: firstName,
        company_name: 'Example',
      })
    })
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      expect(await request.json()).toEqual({ version: 'employee-v1', first_name: 'Taylor' })
      firstName = 'Taylor'
      return HttpResponse.json({ ...employeeResponse, first_name: firstName })
    })
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:id`, getResolver),
      http.put(`${API_BASE_URL}/v1/employees/:id`, updateResolver),
    )
    const { result } = renderHook(
      () => ({
        query: useEmployeesGet({ employeeId: employeeResponse.uuid }),
        mutation: useEmployeesUpdateMutation(),
      }),
      { wrapper: GustoTestProvider },
    )
    await waitFor(() => {
      expect(result.current.query.data?.employeeShow?.firstName).toBe('Alex')
    })
    expect(result.current.query.data?.employeeShow?.companyName).toBe('Example')
    await act(async () => {
      const saved = await result.current.mutation.mutateAsync({
        request: {
          employeeId: employeeResponse.uuid,
          requestBody: { version: 'employee-v1', firstName: 'Taylor' },
        },
      })
      expect(saved.employee?.firstName).toBe('Taylor')
    })
    await waitFor(() => {
      expect(result.current.query.data?.employeeShow?.firstName).toBe('Taylor')
    })
    expect(updateResolver).toHaveBeenCalledOnce()
    expect(getResolver).toHaveBeenCalledTimes(2)
  })

  it('refetches contractorShow and showContractors after a contractor mutation', async () => {
    let firstName = 'Sam'
    const detail = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ ...contractorResponse, first_name: firstName }),
    )
    const list = vi.fn<HttpResponseResolver>(({ request }) => {
      expect(new URL(request.url).searchParams.get('page')).toBe('1')
      return HttpResponse.json(
        [
          { ...contractorResponse, first_name: firstName },
          { uuid: 'business-032', type: 'Business', business_name: 'Example LLC', is_active: true },
        ],
        { headers: { 'x-total-pages': '2', 'x-total-count': '3' } },
      )
    })
    server.use(
      http.get(`${API_BASE_URL}/v1/contractors/:id`, detail),
      http.get(`${API_BASE_URL}/v1/companies/:id/contractors`, list),
      http.put(`${API_BASE_URL}/v1/contractors/:id`, async ({ request }) => {
        expect(await request.json()).toEqual({
          version: 'contractor-v1',
          first_name: 'Jordan',
          type: 'Individual',
          self_onboarding: false,
          file_new_hire_report: false,
        })
        firstName = 'Jordan'
        return HttpResponse.json({ ...contractorResponse, first_name: firstName })
      }),
    )
    const { result } = renderHook(
      () => ({
        detail: useContractorsGet({ contractorUuid: contractorResponse.uuid }),
        list: useContractorsList({ companyUuid: 'company-032', page: 1, per: 2 }),
        mutation: useContractorsUpdateMutation(),
      }),
      { wrapper: GustoTestProvider },
    )
    await waitFor(() => {
      expect(result.current.detail.data?.contractorShow?.firstName).toBe('Sam')
      expect(result.current.list.data?.showContractors).toHaveLength(2)
    })
    expect(result.current.list.data?.showContractors?.[1]?.businessName).toBe('Example LLC')
    expect(result.current.list.data?.httpMeta.response.headers.get('x-total-pages')).toBe('2')
    await act(async () => {
      const saved = await result.current.mutation.mutateAsync({
        request: {
          contractorUuid: contractorResponse.uuid,
          contractorUpdateRequestBody: { version: 'contractor-v1', firstName: 'Jordan' },
        },
      })
      expect(saved.contractor?.firstName).toBe('Jordan')
    })
    await waitFor(() => {
      expect(result.current.detail.data?.contractorShow?.firstName).toBe('Jordan')
      expect(result.current.list.data?.showContractors?.[0]?.firstName).toBe('Jordan')
    })
    expect(detail).toHaveBeenCalledTimes(2)
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('keeps pay-schedule list dates and automatic-payroll settings after the model moves', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:id/pay_schedules`, () =>
        HttpResponse.json([
          {
            uuid: 'schedule-032',
            version: 'schedule-v1',
            frequency: 'Every other week',
            anchor_pay_date: '2026-10-16',
            anchor_end_of_pay_period: '2026-10-11',
            auto_payroll: true,
            workweek_start_day: 'Monday',
          },
        ]),
      ),
    )
    const { result } = renderHook(() => usePaySchedulesGetAll({ companyId: 'company-032' }), {
      wrapper: GustoTestProvider,
    })
    await waitFor(() => {
      expect(result.current.data?.payScheduleShowResponse).toHaveLength(1)
    })
    expect(result.current.data?.payScheduleShowResponse?.[0]).toMatchObject({
      uuid: 'schedule-032',
      version: 'schedule-v1',
      frequency: 'Every other week',
      autoPayroll: true,
      workweekStartDay: 'Monday',
    })
    expect(result.current.data?.payScheduleShowResponse?.[0]?.anchorPayDate?.toString()).toBe(
      '2026-10-16',
    )
  })

  it('preserves approved PTO and distinguishes hours breakdowns from earning amounts on prepare', async () => {
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company/payrolls/:payroll/prepare`, () =>
        HttpResponse.json({
          payroll_uuid: 'payroll-032',
          employee_compensations: [draftCompensation],
        }),
      ),
    )
    const { result } = renderHook(() => usePayrollsPrepareMutation(), {
      wrapper: GustoTestProvider,
    })
    await act(async () => {
      const response = await result.current.mutateAsync({
        request: { companyId: 'company-032', payrollId: 'payroll-032' },
      })
      const compensation = response.payrollPrepared?.employeeCompensations?.[0]
      expect(compensation?.paidTimeOff).toEqual([
        { name: 'Vacation Hours', hours: '0', approvedRequestHours: '8.5' },
        { name: 'Sick Hours', hours: '0', approvedRequestHours: '0.0' },
        { name: 'Holiday Hours', hours: '8', approvedRequestHours: null },
      ])
      expect(compensation?.hourlyCompensations?.[0]?.breakdowns?.[0]).toMatchObject({ hours: '40' })
      expect(compensation?.fixedCompensations?.[0]?.breakdowns?.[0]).toMatchObject({
        amount: '125',
      })
    })
  })

  it('sends additional hours and the locking version without sending approved request hours', async () => {
    const approvedEntry = { name: 'Vacation Hours', hours: '3', approvedRequestHours: '8.5' }
    const update = vi.fn<HttpResponseResolver>(async ({ request }) => {
      expect(await request.json()).toEqual({
        employee_compensations: [
          {
            employee_uuid: 'employee-032',
            version: 'payroll-employee-v1',
            paid_time_off: [{ name: 'Vacation Hours', hours: '3' }],
          },
        ],
      })
      return HttpResponse.json({
        employee_compensations: [
          {
            ...draftCompensation,
            paid_time_off: [{ name: 'Vacation Hours', hours: '3', approved_request_hours: '8.5' }],
          },
        ],
      })
    })
    server.use(http.put(`${API_BASE_URL}/v1/companies/:id/payrolls/:payroll`, update))
    const { result } = renderHook(() => usePayrollsUpdateMutation(), { wrapper: GustoTestProvider })
    await act(async () => {
      const response = await result.current.mutateAsync({
        request: {
          companyId: 'company-032',
          payrollId: 'payroll-032',
          payrollUpdate: {
            employeeCompensations: [
              {
                employeeUuid: 'employee-032',
                version: 'payroll-employee-v1',
                paidTimeOff: [approvedEntry],
              },
            ],
          },
        },
      })
      expect(response.payrollPrepared?.employeeCompensations?.[0]?.paidTimeOff?.[0]).toEqual(
        approvedEntry,
      )
    })
    expect(update).toHaveBeenCalledOnce()
  })

  it('uses the API-calculated PTO total and preserves payroll receipt employee rows', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company/payrolls/:payroll`, () =>
        HttpResponse.json({
          processed: true,
          payroll_uuid: 'payroll-032',
          employee_compensations: [
            {
              employee_uuid: 'employee-032',
              paid_time_off: [{ name: 'Vacation Hours', hours: '11.5' }],
            },
          ],
        }),
      ),
      http.get(`${API_BASE_URL}/v1/payrolls/:payroll/receipt`, () =>
        HttpResponse.json({
          payroll_uuid: 'payroll-032',
          employee_compensations: [
            {
              employee_uuid: 'employee-032',
              employee_first_name: 'Alex',
              employee_last_name: 'Rivera',
              net_pay: '1200.50',
            },
          ],
        }),
      ),
    )
    const { result } = renderHook(
      () => ({
        payroll: usePayrollsGet({ companyId: 'company-032', payrollId: 'payroll-032' }),
        receipt: usePayrollsGetReceipt({ payrollUuid: 'payroll-032' }),
      }),
      { wrapper: GustoTestProvider },
    )
    await waitFor(() => {
      expect(result.current.payroll.data?.payrollShow?.processed).toBe(true)
      expect(result.current.receipt.data?.payrollReceipt?.employeeCompensations).toHaveLength(1)
    })
    const compensation = result.current.payroll.data?.payrollShow?.employeeCompensations?.[0]
    expect(getTotalPtoHours(compensation ?? {})).toBe(11.5)
    expect(compensation?.paidTimeOff?.[0]?.approvedRequestHours).toBeUndefined()
    expect(result.current.receipt.data?.payrollReceipt?.employeeCompensations?.[0]).toMatchObject({
      employeeUuid: 'employee-032',
      employeeFirstName: 'Alex',
      employeeLastName: 'Rivera',
      netPay: '1200.50',
    })
  })
})
