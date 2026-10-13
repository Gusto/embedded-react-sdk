import { describe, expect, it } from 'vitest'
import { PayrollPrepared$inboundSchema } from '@gusto/embedded-api/models/components/payrollshow'
import { payrollDeductionAmountHook } from './payrollDeductionAmountHook'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<typeof payrollDeductionAmountHook.afterSuccess>[0]

const prepareOperation = 'put-v1-companies-company_id-payrolls-payroll_id-prepare'

describe('payrollDeductionAmountHook', () => {
  it.each([
    prepareOperation,
    'put-v1-companies-company_id-payrolls',
    'post-v1-companies-company_id-payrolls',
  ])('validates string deductions for %s without changing other amounts', async operationID => {
    const response = new Response(
      JSON.stringify({
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
      }),
      { headers: { 'content-type': 'application/json', 'x-total-count': '1' } },
    )

    const result = await payrollDeductionAmountHook.afterSuccess(context(operationID), response)
    const payroll = PayrollPrepared$inboundSchema.parse(await result.json())

    expect(payroll.employeeCompensations?.[0]).toMatchObject({
      grossPay: '100.00',
      deductions: [{ amount: 2.5 }, { amount: 10 }, { amount: 0 }],
    })
    expect(result.headers.get('x-total-count')).toBe('1')
    expect(response.bodyUsed).toBe(false)
  })

  it.each([10, '', 'invalid', 'Infinity', null])(
    'leaves numeric or invalid amounts unchanged: %s',
    async amount => {
      const response = new Response(
        JSON.stringify({
          employee_compensations: [{ deductions: [{ amount }] }],
        }),
      )
      expect(
        await payrollDeductionAmountHook.afterSuccess(context(prepareOperation), response),
      ).toBe(response)
    },
  )

  it('preserves the string amounts expected by the payroll show schema', async () => {
    const response = new Response(
      JSON.stringify({
        employee_compensations: [{ deductions: [{ amount: '2.50' }] }],
      }),
    )
    expect(
      await payrollDeductionAmountHook.afterSuccess(
        context('get-v1-companies-company_id-payrolls-payroll_id'),
        response,
      ),
    ).toBe(response)
  })

  it.each(['invalid json', JSON.stringify({}), JSON.stringify({ employee_compensations: [null] })])(
    'passes malformed or missing data to normal validation',
    async body => {
      const response = new Response(body)
      expect(
        await payrollDeductionAmountHook.afterSuccess(context(prepareOperation), response),
      ).toBe(response)
    },
  )
})
