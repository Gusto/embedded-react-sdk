import { test as base } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { ScenarioContext } from '../scenario/context'
import { provisionScenario } from '../scenario/runner'

interface E2EState {
  flowToken: string
  companyId: string
  employeeId: string
  contractorId: string
  locationId: string
  dismissalCompanyId: string
  dismissalFlowToken: string
  terminatedEmployeeId: string
  payScheduleUuid: string
}

interface LocalConfig {
  isLocal: boolean
  flowToken: string
  companyId: string
  employeeId: string
  contractorId: string
  locationId: string
  dismissalCompanyId: string
  dismissalFlowToken: string
  terminatedEmployeeId: string
  payScheduleUuid: string
}

export type ScenarioFixtures = { scenario: ScenarioContext }

type ScenarioCache = Map<string, Promise<ScenarioContext>>

interface WorkerFixtures {
  _scenarioCache: ScenarioCache
}

const EMPTY_SCENARIO_CONTEXT: ScenarioContext = {
  flowToken: '',
  companyId: '',
  locationIds: {},
  employeeIds: {},
  contractorIds: {},
  payrollIds: {},
}

function loadDynamicState(): Partial<E2EState> {
  const statePath = resolve(process.cwd(), 'e2e/.e2e-state.json')
  if (existsSync(statePath)) {
    const content = readFileSync(statePath, 'utf-8')
    return JSON.parse(content)
  }
  return {}
}

export const test = base.extend<ScenarioFixtures & { localConfig: LocalConfig }, WorkerFixtures>({
  // Worker-scoped cache that lets every test sharing a scenario ID reuse a
  // single provisioned demo company. Without this each test pays a full
  // POST /demos round-trip + decoration (~16s on flows.gusto-demo.com),
  // dominating shard wall time. Storing a Promise (not the resolved
  // context) means a race within a worker shares a single in-flight
  // provisioning attempt instead of issuing duplicates.
  _scenarioCache: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const cache: ScenarioCache = new Map()
      await use(cache)
    },
    { scope: 'worker' },
  ],

  localConfig: [
    async ({}, use) => {
      const isLocal = process.env.E2E_USE_REAL_BACKEND === 'true'
      const dynamicState = isLocal ? loadDynamicState() : {}

      const config: LocalConfig = {
        isLocal,
        flowToken: dynamicState.flowToken || process.env.E2E_FLOW_TOKEN || '',
        companyId: dynamicState.companyId || process.env.E2E_COMPANY_ID || '123',
        employeeId: dynamicState.employeeId || process.env.E2E_EMPLOYEE_ID || '456',
        contractorId: dynamicState.contractorId || '789',
        locationId: dynamicState.locationId || '',
        dismissalCompanyId: isLocal ? dynamicState.dismissalCompanyId || '' : '123',
        dismissalFlowToken: isLocal ? dynamicState.dismissalFlowToken || '' : '',
        terminatedEmployeeId: isLocal
          ? dynamicState.terminatedEmployeeId || ''
          : 'dismissal-test-employee',
        payScheduleUuid: dynamicState.payScheduleUuid || '',
      }

      await use(config)
    },
    { option: true },
  ],

  scenario: [
    async ({ _scenarioCache }, use, testInfo) => {
      const annotation = testInfo.annotations.find(a => a.type === 'scenario')
      if (!annotation?.description) {
        await use(EMPTY_SCENARIO_CONTEXT)
        return
      }

      const scenarioId = annotation.description
      const scenarioPath = resolve(process.cwd(), 'e2e/scenarios', `${scenarioId}.json`)
      const scenarioJson = JSON.parse(readFileSync(scenarioPath, 'utf-8')) as {
        domain?: string
      }
      if (scenarioJson.domain) {
        testInfo.annotations.push({ type: 'tag', description: `@${scenarioJson.domain}` })
      }

      // Scenario provisioning hits gws-flows to mint a fresh demo company
      // per test. That requires a real backend, so we only do it when
      // E2E_USE_REAL_BACKEND is set (true in CI's e2e job and via
      // playwright.demo.config.ts / playwright.local.config.ts). When tests
      // run against MSW mocks (the default `playwright test` config), no
      // backend is reachable and we hand back an empty context — every
      // scenario-driven spec self-skips via `test.skip(!scenario.flowToken)`.
      //
      // Note: an earlier version of this fixture gated on a separate
      // E2E_LOCAL env var that was never set anywhere in the repo, which
      // silently caused every scenario-based spec (including the canary
      // suites) to skip in CI. Don't add another gate here without making
      // sure something actually sets it.
      if (process.env.E2E_USE_REAL_BACKEND !== 'true') {
        await use(EMPTY_SCENARIO_CONTEXT)
        return
      }

      // Phase-level timing: capture how long scenario provisioning takes
      // (creates a fresh demo company + decorates it) so we can see at the
      // reporter level whether tests are spending their time on setup or on
      // the actual SDK flow under test. See e2e/reporters/scenario-reporter.
      //
      // Cache hits are typically <50ms (a Map lookup + an already-resolved
      // promise await); cache misses pay full demo creation + decoration.
      // The reporter renders cacheHit=true entries with a "(cached)" marker
      // so the timings.md summary makes it obvious when reuse is engaged.
      let provisioningPromise = _scenarioCache.get(scenarioId)
      const cacheHit = provisioningPromise !== undefined

      const provisioningStart = Date.now()
      if (!provisioningPromise) {
        provisioningPromise = provisionScenario(scenarioPath)
        _scenarioCache.set(scenarioId, provisioningPromise)
      }

      let ctx: ScenarioContext
      try {
        ctx = await provisioningPromise
      } catch (error) {
        // Don't poison the cache for the rest of the worker if a single
        // provisioning attempt fails — let the next test for this scenario
        // retry from scratch instead of inheriting a permanently broken
        // entry.
        _scenarioCache.delete(scenarioId)
        throw error
      }

      const provisioningMs = Date.now() - provisioningStart
      testInfo.annotations.push({
        type: 'timing',
        description: JSON.stringify({
          phase: 'provisioning',
          durationMs: provisioningMs,
          cacheHit,
        }),
      })

      await use(ctx)
    },
    { scope: 'test' },
  ],

  page: async ({ page, localConfig, scenario }, use) => {
    const originalGoto = page.goto.bind(page)

    page.goto = async (url: string, options?: Parameters<typeof page.goto>[1]) => {
      const parsedUrl = new URL(url, 'http://localhost:5173')
      const params = parsedUrl.searchParams

      if (scenario.flowToken) {
        params.set('local', 'true')
        params.set('flowToken', scenario.flowToken)
        params.set('companyId', scenario.companyId)

        const firstEmployee = Object.values(scenario.employeeIds)[0]
        if (firstEmployee && !params.has('employeeId')) params.set('employeeId', firstEmployee)

        const firstContractor = Object.values(scenario.contractorIds)[0]
        if (firstContractor && !params.has('contractorId'))
          params.set('contractorId', firstContractor)

        if (scenario.paySchedule?.uuid) params.set('payScheduleUuid', scenario.paySchedule.uuid)
      } else {
        const isDismissalFlow = params.get('flow') === 'dismissal'
        const hasDismissalCompany = Boolean(
          localConfig.dismissalCompanyId && localConfig.dismissalFlowToken,
        )

        if (localConfig.isLocal) {
          const flowToken =
            isDismissalFlow && hasDismissalCompany
              ? localConfig.dismissalFlowToken
              : localConfig.flowToken
          if (flowToken) {
            params.set('local', 'true')
            params.set('flowToken', flowToken)
          }
        }

        if (!params.has('companyId') || params.get('companyId') === '123') {
          const companyId =
            isDismissalFlow && hasDismissalCompany
              ? localConfig.dismissalCompanyId
              : localConfig.companyId
          params.set('companyId', companyId)
        }
        if (!params.has('employeeId') || params.get('employeeId') === '456') {
          params.set('employeeId', localConfig.employeeId)
        }
        if (!params.has('contractorId') || params.get('contractorId') === '789') {
          params.set('contractorId', localConfig.contractorId)
        }
        if (localConfig.payScheduleUuid && params.has('payScheduleUuid')) {
          params.set('payScheduleUuid', localConfig.payScheduleUuid)
        }
      }

      const newUrl = `${parsedUrl.pathname}?${params.toString()}`
      return originalGoto(newUrl, options)
    }

    await use(page)
  },
})

export { expect } from '@playwright/test'
