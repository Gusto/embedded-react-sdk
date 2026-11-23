import { renderHook } from '@testing-library/react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { earningTypesList } from '@gusto/embedded-api/funcs/earningTypesList'
import { informationRequestsGetInformationRequests } from '@gusto/embedded-api/funcs/informationRequestsGetInformationRequests'
import { paySchedulesGetAll } from '@gusto/embedded-api/funcs/paySchedulesGetAll'
import { paySchedulesGet } from '@gusto/embedded-api/funcs/paySchedulesGet'
import { paySchedulesCreate } from '@gusto/embedded-api/funcs/paySchedulesCreate'
import { paySchedulesUpdate } from '@gusto/embedded-api/funcs/paySchedulesUpdate'
import { paySchedulesPreviewAssignment } from '@gusto/embedded-api/funcs/paySchedulesPreviewAssignment'
import { payrollsList } from '@gusto/embedded-api/funcs/payrollsList'
import { payrollsGet } from '@gusto/embedded-api/funcs/payrollsGet'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import { payrollsUpdate } from '@gusto/embedded-api/funcs/payrollsUpdate'
import { payrollsCreateOffCycle } from '@gusto/embedded-api/funcs/payrollsCreateOffCycle'
import { payrollsCancel } from '@gusto/embedded-api/funcs/payrollsCancel'
import { unwrapAsync } from '@gusto/embedded-api/types/fp'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { ResponseValidationError } from '@gusto/embedded-api/models/errors/responsevalidationerror'
import type { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import type { PropsWithChildren } from 'react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ApiProvider } from './ApiProvider'
import { API_VERSION } from './apiVersion'
import { API_BASE_URL } from '@/test/constants'
import { server } from '@/test/mocks/server'

const companyId = 'company-1'
const payrollId = 'payroll-1'
const payScheduleId = 'schedule-1'
const companyPath = `${API_BASE_URL}/v1/companies/${companyId}`
const payrollPath = `${companyPath}/payrolls/${payrollId}`

function renderClient() {
  return renderHook(() => useGustoEmbeddedContext(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <ApiProvider url={API_BASE_URL}>{children}</ApiProvider>
    ),
  }).result.current
}

const payrollResponse = {
  payroll_uuid: payrollId,
  off_cycle: true,
  off_cycle_reason: 'Max out 401k',
  employee_compensations: [
    {
      employee_uuid: 'employee-1',
      gross_pay: '100.00',
      deductions: [
        { name: 'Percentage', amount: '2.50', amount_type: 'percent' },
        { name: 'Fixed', amount: '10.00', amount_type: 'fixed' },
        { name: 'Zero', amount: '0.00', amount_type: 'fixed' },
      ],
    },
  ],
}

const payrollOperations = [
  {
    name: 'prepare',
    handler: http.put,
    path: `${payrollPath}/prepare`,
    decode: async (client: GustoEmbeddedCore) =>
      (await unwrapAsync(payrollsPrepare(client, { companyId, payrollId }))).payrollPrepared,
  },
  {
    name: 'update',
    handler: http.put,
    path: payrollPath,
    decode: async (client: GustoEmbeddedCore) =>
      (
        await unwrapAsync(
          payrollsUpdate(client, {
            companyId,
            payrollId,
            payrollUpdate: { employeeCompensations: [] },
          }),
        )
      ).payrollPrepared,
  },
]

describe('ApiProvider generated operation decoding', () => {
  it('delivers every earning type after adapting an unknown category', async () => {
    server.use(
      http.get(`${companyPath}/earning_types`, () =>
        HttpResponse.json({
          default: [{ uuid: 'regular', name: 'Regular', category: 'Commission' }],
          custom: [{ uuid: 'bonus', name: 'Bonus', category: 'FlatSumBonus', active: true }],
        }),
      ),
    )

    const response = await unwrapAsync(earningTypesList(renderClient(), { companyId }))

    expect(response.earningTypeList).toEqual({
      default: [{ uuid: 'regular', name: 'Regular', category: 'Commission' }],
      custom: [{ uuid: 'bonus', name: 'Bonus', active: true }],
    })
  })

  it('delivers information requests with renderable enum values and preserved questions', async () => {
    server.use(
      http.get(`${companyPath}/information_requests`, () =>
        HttpResponse.json([
          {
            uuid: 'request-1',
            blocking_payroll: true,
            type: 'unknown_type',
            status: 'unknown_status',
            required_questions: [
              { question_uuid: 'q1', question_text: 'Upload', response_type: 'document' },
              { question_uuid: 'q2', question_text: 'Explain', response_type: 'unknown_input' },
            ],
          },
          { uuid: 'request-2', type: 'company_onboarding', status: 'approved' },
        ]),
      ),
    )

    const response = await unwrapAsync(
      informationRequestsGetInformationRequests(renderClient(), { companyUuid: companyId }),
    )

    expect(response.informationRequests).toEqual([
      {
        uuid: 'request-1',
        blockingPayroll: true,
        type: null,
        status: 'pending_response',
        requiredQuestions: [
          { questionUuid: 'q1', questionText: 'Upload', responseType: 'document' },
          { questionUuid: 'q2', questionText: 'Explain', responseType: 'text' },
        ],
      },
      { uuid: 'request-2', type: 'company_onboarding', status: 'approved' },
    ])
  })

  it.each(payrollOperations)(
    'decodes $name through its own deduction and reason schemas',
    async ({ handler, path, decode }) => {
      server.use(handler(path, () => HttpResponse.json(payrollResponse)))

      expect(await decode(renderClient())).toMatchObject({
        payrollUuid: payrollId,
        offCycleReason: null,
        employeeCompensations: [
          {
            employeeUuid: 'employee-1',
            grossPay: '100.00',
            deductions: [{ amount: 2.5 }, { amount: 10 }, { amount: 0 }],
          },
        ],
      })
    },
  )

  it('preserves deduction strings in the show decoder', async () => {
    server.use(http.get(payrollPath, () => HttpResponse.json(payrollResponse)))

    const response = await unwrapAsync(payrollsGet(renderClient(), { companyId, payrollId }))

    expect(response.payrollShow).toMatchObject({
      offCycleReason: null,
      employeeCompensations: [
        { deductions: [{ amount: '2.50' }, { amount: '10.00' }, { amount: '0.00' }] },
      ],
    })
  })

  it('decodes off-cycle creation without exposing deductions absent from the June schema', async () => {
    server.use(http.post(`${companyPath}/payrolls`, () => HttpResponse.json(payrollResponse)))

    const response = await unwrapAsync(payrollsCreateOffCycle(renderClient(), { companyId }))

    expect(response.payrollUnprocessed).toMatchObject({
      payrollUuid: payrollId,
      offCycleReason: null,
    })
    expect(response.payrollUnprocessed?.employeeCompensations).toEqual([
      { employeeUuid: 'employee-1', grossPay: '100.00' },
    ])
  })

  it('keeps every payroll in a list containing an unknown off-cycle reason', async () => {
    server.use(
      http.get(`${companyPath}/payrolls`, () =>
        HttpResponse.json([
          { payroll_uuid: payrollId, off_cycle_reason: 'Max out 401k' },
          { payroll_uuid: 'payroll-2', off_cycle_reason: 'Bonus' },
        ]),
      ),
    )

    const response = await unwrapAsync(payrollsList(renderClient(), { companyId }))

    expect(response.payrollList).toEqual([
      { payrollUuid: payrollId, offCycleReason: null },
      { payrollUuid: 'payroll-2', offCycleReason: 'Bonus' },
    ])
  })

  it('decodes an unknown reason through the cancel operation', async () => {
    server.use(
      http.put(`${payrollPath}/cancel`, () =>
        HttpResponse.json({ payroll_uuid: payrollId, off_cycle_reason: 'Other' }),
      ),
    )

    const response = await unwrapAsync(payrollsCancel(renderClient(), { companyId, payrollId }))

    expect(response.unprocessedPayroll).toMatchObject({
      payrollUuid: payrollId,
      offCycleReason: null,
    })
  })

  it.each([
    {
      name: 'list',
      handler: http.get,
      path: `${companyPath}/pay_schedules`,
      status: 200,
      decode: async (client: GustoEmbeddedCore) =>
        (await unwrapAsync(paySchedulesGetAll(client, { companyId }))).payScheduleShowResponse?.[0],
    },
    {
      name: 'show',
      handler: http.get,
      path: `${companyPath}/pay_schedules/${payScheduleId}`,
      status: 200,
      decode: async (client: GustoEmbeddedCore) =>
        (await unwrapAsync(paySchedulesGet(client, { companyId, payScheduleId }))).payScheduleShow,
    },
    {
      name: 'create',
      handler: http.post,
      path: `${companyPath}/pay_schedules`,
      status: 201,
      decode: async (client: GustoEmbeddedCore) =>
        (
          await unwrapAsync(
            paySchedulesCreate(client, {
              companyId,
              payScheduleCreateRequest: {
                frequency: 'Every week',
                anchorPayDate: new RFCDate('2026-01-23'),
                anchorEndOfPayPeriod: new RFCDate('2026-01-16'),
              },
            }),
          )
        ).payScheduleShow,
    },
    {
      name: 'update',
      handler: http.put,
      path: `${companyPath}/pay_schedules/${payScheduleId}`,
      status: 200,
      decode: async (client: GustoEmbeddedCore) =>
        (
          await unwrapAsync(
            paySchedulesUpdate(client, {
              companyId,
              payScheduleId,
              payScheduleUpdateRequest: { version: 'v1' },
            }),
          )
        ).payScheduleShow,
    },
  ])(
    'decodes a null custom name through schedule $name',
    async ({ name, handler, path, status, decode }) => {
      const schedule = {
        uuid: payScheduleId,
        version: 'v1',
        frequency: 'Every week',
        custom_name: null,
      }
      server.use(
        handler(path, () => HttpResponse.json(name === 'list' ? [schedule] : schedule, { status })),
      )

      expect(await decode(renderClient())).toEqual({
        uuid: payScheduleId,
        version: 'v1',
        frequency: 'Every week',
      })
    },
  )

  it('delivers assignment changes with absent periods and preserves populated periods', async () => {
    const period = { start_date: '2026-01-01', end_date: '2026-01-15', check_date: '2026-01-20' }
    server.use(
      http.post(`${companyPath}/pay_schedules/assignment_preview`, () =>
        HttpResponse.json({
          type: 'single',
          employee_changes: [
            { employee_uuid: 'employee-1', first_pay_period: period, transition_pay_period: null },
            { employee_uuid: 'employee-2', first_pay_period: null, transition_pay_period: null },
          ],
        }),
      ),
    )

    const response = await unwrapAsync(
      paySchedulesPreviewAssignment(renderClient(), {
        companyId,
        payScheduleAssignmentBody: { type: 'single' },
      }),
    )

    expect(response.payScheduleAssignmentPreview?.employeeChanges).toEqual([
      {
        employeeUuid: 'employee-1',
        firstPayPeriod: { startDate: '2026-01-01', endDate: '2026-01-15', checkDate: '2026-01-20' },
      },
      { employeeUuid: 'employee-2' },
    ])
  })

  it('still rejects invalid deductions instead of masking an unrelated schema error', async () => {
    server.use(
      http.put(`${payrollPath}/prepare`, () =>
        HttpResponse.json({
          employee_compensations: [{ deductions: [{ amount: 'invalid' }] }],
        }),
      ),
    )

    await expect(
      unwrapAsync(payrollsPrepare(renderClient(), { companyId, payrollId })),
    ).rejects.toBeInstanceOf(ResponseValidationError)
  })

  it('preserves response version metadata after adapting a body', async () => {
    server.use(
      http.get(payrollPath, () =>
        HttpResponse.json(payrollResponse, {
          headers: { 'X-Gusto-API-Version': API_VERSION, 'X-Request-Id': 'request-1' },
        }),
      ),
    )

    const response = await unwrapAsync(payrollsGet(renderClient(), { companyId, payrollId }))

    expect(response.httpMeta.response.headers.get('X-Gusto-API-Version')).toBe(API_VERSION)
    expect(response.httpMeta.response.headers.get('X-Request-Id')).toBe('request-1')
  })
})
