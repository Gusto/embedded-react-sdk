import { test, expect } from '../../utils/localTestFixture'
import { runContractorSelfOnboarding } from '../../utils/contractorFlowDrivers'
import { CANARY_TEST_TIMEOUT_MS } from '../../utils/timeouts'

test.describe.serial('ContractorCanary 04 — individual self-onboarding end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('drives the seeded individual contractor through self-onboarding to "You\'re all set!"', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(CANARY_TEST_TIMEOUT_MS)

    const contractorId = scenario.contractorIds.selfindividual
    if (!contractorId) {
      test.skip(true, 'Requires scenario.contractorIds.selfindividual')
      return
    }

    await runContractorSelfOnboarding(page, scenario, { contractorId, type: 'individual' })

    await expect(page.getByRole('heading', { name: /you're all set/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
