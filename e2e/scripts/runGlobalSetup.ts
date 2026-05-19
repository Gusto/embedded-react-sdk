/**
 * Standalone CLI wrapper that runs e2e/globalSetup.ts once and exits.
 *
 * Used by the upstream `e2e-setup` CI job to provision demo companies a
 * single time and persist them to e2e/.e2e-state.json. The matrix shards
 * download that file via actions artifacts and skip provisioning thanks to
 * globalSetup's idempotency check, dropping per-shard cold-start time from
 * ~3 minutes to a few seconds and reducing concurrent load on
 * flows.gusto-demo.com.
 *
 * Locally you typically don't need to invoke this directly — running any
 * E2E spec with E2E_LOCAL=true will trigger globalSetup as part of the
 * Playwright run.
 */
import globalSetup from '../globalSetup'

globalSetup()
  .then(() => {
    console.log('✅ Global setup complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Global setup failed:', error)
    process.exit(1)
  })
