import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * GEP v2025-11-15 changed the `Wire-In-Request.payment_type` enum value
 * from `'Payroll'` to `'payroll'` (lowercase). The new SDK's Zod schema in
 * `@gusto/embedded-api-v-2025-11-15/models/components/wireinrequest`
 * defines `PaymentType` as `{ Payroll: 'payroll', ContractorPaymentGroup:
 * 'ContractorPaymentGroup' }` (note the asymmetric casing — only the
 * Payroll value is lowercase) and rejects any other value with a
 * ZodError on response validation.
 *
 * Six SDK component surfaces suspense-load `wireInRequestsList`:
 *   - PayrollList.tsx
 *   - PayrollHistory.tsx
 *   - PayrollLanding/PayrollLandingFlowComponents.tsx
 *   - ConfirmWireDetails.tsx
 *   - ConfirmWireDetailsBanner.tsx
 *   - WireInstructions/WireInstructions.tsx
 *
 * If the backend (or in the case of demo, flows.gusto-demo.com) returns
 * the old capitalized `'Payroll'` value when called with the new
 * `X-Gusto-API-Version: 2025-11-15` header, Zod validation throws,
 * React's error boundary catches it, and `InternalError` renders with
 * `data-testid="internal-error-card"` and the i18n string
 * `common.errors.globalReactError` ("Error while rendering SDK
 * component: {{error}}"). The user sees that banner in place of the
 * expected screen content.
 *
 * Positive contract for this spec: navigating to the payroll landing
 * page surfaces the Run Payroll tab without rendering the
 * InternalError boundary fallback. The error card is the negative-space
 * assertion target because we want the test to fail loudly *exactly*
 * when this Zod validation regresses, regardless of which of the six
 * surfaces above triggered it.
 *
 * We use the `biweekly-shared` scenario (the same read-only scenario
 * used by every other non-mutating payroll lifecycle spec) rather than
 * provisioning a dedicated one — the contract under test is purely on
 * the response shape of GET /v1/companies/:id/wire-in-requests, which
 * fires on every page load regardless of company state.
 */
test.describe('Payroll lifecycle — Wire-In-Request payment_type enum regression', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/biweekly-shared',
    })
  })

  test('PayrollList renders without an InternalError boundary on initial load and after reload', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('internal-error-card')).toBeHidden()

    // Reload path: in development we observed the wireInRequestsList Zod
    // failure only manifested when returning to the payroll flow after
    // initial load — the React Query cache made the first paint cheap
    // enough that the broken response wasn't deserialized through the
    // schema in some renders. A full page reload forces the query cache
    // to repopulate from the network, which is where the regression
    // actually surfaced. We exercise that path explicitly so the spec
    // fails in the same conditions we saw the bug fire.
    await page.reload()
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('internal-error-card')).toBeHidden()
    await expect(page.getByText(/error while rendering sdk component/i)).toBeHidden()
  })
})
