import { useSuspenseQuery } from '@tanstack/react-query'
import { handleResponse } from './helpers'
import { useGustoApi } from '@/api/context'
import { PayPeriod } from '@/models/PayPeriod'
import { Payroll, PayrollStatusMeta } from '@/models/Payroll'
import { PayrollTotals } from '@/models/PayrollTotals'

// @ts-expect-error: FIXME how do we type data?
const mapPayrollObject = data => {
  const payPeriod = data.pay_period
    ? new PayPeriod({
        payScheduleUuid: data.pay_period.pay_schedule_uuid,
        startDate: new Date(data.pay_period.start_date),
        endDate: new Date(data.pay_period.end_date),
      })
    : null

  const totals = data.totals
    ? new PayrollTotals({
        grossPay: Number(data.totals.gross_pay),
        employerTaxes: Number(data.totals.employer_taxes),
        reimbursements: Number(data.totals.reimbursements),
        benefits: Number(data.totals.benefits),
        companyDebit: Number(data.totals.company_debit),
      })
    : null

  const payrollStatusMeta = data.payroll_status_meta
    ? new PayrollStatusMeta({
        cancellable: data.payroll_status_meta.cancellable,
        payrollLate: data.payroll_status_meta.payroll_late,
        expectedCheckDate: new Date(data.payroll_status_meta.expected_check_date),
        initialCheckDate: new Date(data.payroll_status_meta.initial_check_date),
        expectedDebitTime: new Date(data.payroll_status_meta.expected_debit_time),
        initialDebitCutoffTime: new Date(data.payroll_status_meta.initial_debit_cutoff_time),
      })
    : null

  return new Payroll({
    uuid: data.payroll_uuid,
    processed: data.processed,
    payPeriod,
    totals,
    checkDate: new Date(data.check_date),
    payrollDeadline: new Date(data.payroll_deadline),
    payrollStatusMeta,
  })
}

export function useGetPendingPayrolls(company_id: string) {
  const { GustoClient: client } = useGustoApi()

  return useSuspenseQuery({
    queryKey: ['company', company_id, 'pendingPayrolls'],
    queryFn: () => client.getPendingPayrolls(company_id).then(handleResponse),
  })
}

export function useGetHistoricalPayrolls(companyId: string, startDate: Date, endDate: Date) {
  const { GustoClient: client } = useGustoApi()

  return useSuspenseQuery({
    queryKey: ['company', companyId, 'historicalPayrolls'],
    queryFn: () =>
      client
        .getHistoricalPayrolls(companyId, startDate, endDate)
        .then(responseData =>
          handleResponse(responseData)
            .filter(payroll => payroll.processed)
            .sort((b, a) => {
              const aDate = a.pay_period?.start_date || a.check_date
              const bDate = b.pay_period?.start_date || b.check_date
              return Date.parse(aDate ?? '') - Date.parse(bDate ?? '')
            }),
        )
        .then(data => data.map(mapPayrollObject)),
  })
}

export function useGetPayroll(companyId: string, payrollId: string) {
  const { GustoClient: client } = useGustoApi()

  return useSuspenseQuery({
    queryKey: ['company', companyId, 'payroll', payrollId],
    queryFn: () =>
      client.getPayroll(companyId, payrollId).then(handleResponse).then(mapPayrollObject),
  })
}
