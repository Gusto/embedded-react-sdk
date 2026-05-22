import { test, expect } from '../../../utils/localTestFixture'
import { skipFirstUnprocessedPayroll } from '../../../utils/payrollFlowDrivers'
import { CANARY_TEST_TIMEOUT_MS } from '../../../utils/timeouts'

/**
 * GEP v2025-11-15 added `pay_schedule_uuid` + `end_date` as required fields
 * to the body of `POST /v1/companies/:id/payrolls/skip` (in addition to the
 * pre-existing `payroll_type` + `start_date`). The SDK's PayrollList
 * already sends all four fields (PayrollList.tsx#L128-L137):
 *
 *     await skipPayroll({
 *       request: {
 *         companyUuid: companyId,
 *         requestBody: {
 *           payrollType,
 *           startDate: payroll.payPeriod?.startDate,
 *           endDate: payroll.payPeriod?.endDate,
 *           payScheduleUuid: payroll.payPeriod?.payScheduleUuid,
 *         },
 *       },
 *     })
 *
 * The positive contract: against the v11-15 backend, driving the SDK's
 * "Skip payroll" UI completes successfully and the success alert
 * ("Payroll skipped", PayrollList i18n.skipSuccessAlert) renders. If the
 * SDK regressed and dropped either of the new required fields, the
 * backend would return 422 and the success alert would never appear.
 *
 * Uses its own scenario (payroll/skip-payroll) rather than
 * payroll/full-flow-canary because skipping is destructive: it consumes the
 * current open biweekly period that 01-regular-payroll, 02-off-cycle-bonus,
 * 04-transition, and 05-dismissal expect to still be unprocessed.
 */
test.describe.serial('PayrollCanary 08 — Skip Payroll sends v11-15 required fields', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/skip-payroll',
    })
  })

  test('skips the open biweekly payroll and surfaces the success alert', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(CANARY_TEST_TIMEOUT_MS)

    await skipFirstUnprocessedPayroll(page, scenario)
  })
})
