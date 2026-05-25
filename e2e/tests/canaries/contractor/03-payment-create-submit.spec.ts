import { test, expect } from '../../../utils/localTestFixture'
import { runContractorPayment } from '../../../utils/contractorFlowDrivers'

test.describe.serial('ContractorCanary 03 — contractor payment end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded-canary',
    })
  })

  test('drives a contractor payment from list through review to Payment Summary success', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await runContractorPayment(page, scenario)

    await expect(page.getByRole('heading', { name: /^payment summary$/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
