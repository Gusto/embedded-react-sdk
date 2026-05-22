import { test, expect } from '../../../utils/localTestFixture'
import {
  landOnEditPayrollForNextRegular,
  openEditEmployeeForFirstRow,
  saveEditEmployeeAndReturn,
} from '../../../utils/payrollFlowDrivers'
import { CANARY_TEST_TIMEOUT_MS, PAYROLL_CALCULATION_DEADLINE } from '../../../utils/timeouts'

/**
 * GEP v2025-11-15 moved reimbursements out of the aggregated
 * `fixed_compensations` / `fixed_compensation_types` arrays into their own
 * itemized array on `employee_compensations`. The SDK reads the
 * reimbursement value back from `employeeCompensation.fixedCompensations`
 * (PayrollEditEmployeePresentation.tsx#L192 — `getReimbursementCompensation(...)`)
 * and renders it as a dedicated `Reimbursement` field group separate from
 * "Additional earnings".
 *
 * This spec proves the round-trip works end-to-end on the v11-15 backend:
 *   1. Open Edit Payroll, open the per-row Edit form for the first employee.
 *   2. Enter $50 in the Reimbursement field and Save.
 *   3. Assert the per-employee compensations table re-renders showing
 *      the row's Reimbursements column = "$50.00".
 *
 * The table re-render is the positive contract for both write (SDK sent
 * reimbursement in the right field) and read (SDK parsed reimbursement
 * from the itemized array on the read-back). If either side regressed,
 * the column would not show $50.00.
 *
 * We intentionally stop at the table re-render rather than running the
 * payroll through to receipt — receipt submission costs ~3 additional
 * minutes per run and the wire-format contract is already proven by the
 * table row update.
 */
test.describe('PayrollCanary 06 — reimbursement entered on PayrollEditEmployee persists', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/full-flow-canary',
    })
  })

  test('records a $50 reimbursement on the first employee and renders it on the Edit Payroll table', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(CANARY_TEST_TIMEOUT_MS)

    await landOnEditPayrollForNextRegular(page, scenario)

    // Capture the first row's accessible name (e.g. "Hannah Arendt $61,000.00/yr")
    // before we open the per-row editor, so we can scope the post-save table
    // assertion to that exact row regardless of how it sorts after a re-fetch.
    const firstRowName = await page.getByRole('row').nth(1).getAttribute('aria-label')

    await openEditEmployeeForFirstRow(page)

    await expect(page.getByRole('heading', { name: /^reimbursement$/i, level: 4 })).toBeVisible({
      timeout: PAYROLL_CALCULATION_DEADLINE,
    })

    // The reimbursement field's accessible label is the per-policy display
    // name returned by `getFixedCompensationLabel(reimbursement.name)` — for
    // the standard reimbursement compensation that resolves to
    // i18n.fixedCompensationNames.reimbursement === "Reimbursement".
    await page.getByLabel(/^reimbursement$/i).fill('50')

    await saveEditEmployeeAndReturn(page)

    // Positive contract: the row we edited now shows $50.00 in its
    // Reimbursements column. The column ordering on Edit Payroll is
    // Employees | Hours | Time off | Additional earnings | Reimbursements |
    // Total pay | Actions (Payroll.PayrollConfiguration.tableColumns).
    const editedRow = firstRowName
      ? page.getByRole('row', { name: new RegExp(firstRowName.replace(/[$()/.]/g, '.'), 'i') })
      : page.getByRole('row').nth(1)

    await expect(editedRow.getByRole('gridcell', { name: '$50.00' }).first()).toBeVisible({
      timeout: PAYROLL_CALCULATION_DEADLINE,
    })
  })
})
