import { test, expect } from '../../utils/localTestFixture'
import { runContractorPayment } from '../../utils/contractorFlowDrivers'

test.describe.serial('ContractorCanary 03 — contractor payment end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('drives a contractor payment from list through review to Payment Summary success', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await runContractorPayment(page, scenario)

    // "Payment summary" is also the review page's own totals-grid heading, so
    // asserting on it alone can pass before submission actually completes.
    await expect(page.getByRole('heading', { name: /^review and submit$/i })).toBeHidden({
      timeout: 60_000,
    })
  })
})
