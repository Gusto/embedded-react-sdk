import { test, expect } from '../../../utils/localTestFixture'
import { runIndividualContractorOnboarding } from '../../../utils/contractorFlowDrivers'

test.describe.serial('ContractorCanary 01 — individual contractor onboarding end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'contractor/full-flow-canary',
    })
  })

  test('drives a new Individual contractor from list through submit to onboarded success', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(5 * 60_000)

    await runIndividualContractorOnboarding(page, scenario)

    await expect(page.getByRole('heading', { name: /^contractors$/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
