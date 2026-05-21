import { test as base } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { ScenarioContext } from '../scenario/context'
import { createValidationErrorCollector } from './validationErrorCollector'

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

interface ScenariosArtifact {
  scenarios: Record<string, ScenarioContext>
}

export type ScenarioFixtures = { scenario: ScenarioContext }

interface WorkerFixtures {
  /**
   * Worker-scoped Map of scenarioId -> ScenarioContext, loaded once per
   * worker from e2e/.e2e-scenarios.json. The artifact is written by
   * globalSetup (or downloaded from the e2e-setup CI job's artifact); tests
   * just look up their scenario synchronously.
   */
  _scenariosMap: Map<string, ScenarioContext>
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

function loadScenariosMap(): Map<string, ScenarioContext> {
  const map = new Map<string, ScenarioContext>()
  const scenariosPath = resolve(process.cwd(), 'e2e/.e2e-scenarios.json')
  if (!existsSync(scenariosPath)) return map
  try {
    const content = readFileSync(scenariosPath, 'utf-8')
    const parsed = JSON.parse(content) as ScenariosArtifact
    for (const [id, ctx] of Object.entries(parsed.scenarios)) {
      map.set(id, ctx)
    }
  } catch {
    // Malformed file — return empty map; the scenario fixture will throw a
    // clearer error on first lookup.
  }
  return map
}

export const test = base.extend<ScenarioFixtures & { localConfig: LocalConfig }, WorkerFixtures>({
  // Worker-scoped Map of all provisioned scenarios, loaded once per worker
  // from e2e/.e2e-scenarios.json. This file is produced by globalSetup
  // (running in e2e-setup CI job or locally) and downloaded as an artifact
  // by every domain shard. Per-test cost is a Map.get — tests no longer
  // race the demo backend during their run.
  _scenariosMap: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const map = loadScenariosMap()
      await use(map)
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
    async ({ _scenariosMap }, use, testInfo) => {
      const annotation = testInfo.annotations.find(a => a.type === 'scenario')
      if (!annotation?.description) {
        await use(EMPTY_SCENARIO_CONTEXT)
        return
      }

      const scenarioId = annotation.description

      // Skip scenario provisioning when running against MSW mocks (the
      // default `playwright test` config). Every scenario-driven spec
      // self-skips via `test.skip(!scenario.flowToken)`.
      if (process.env.E2E_USE_REAL_BACKEND !== 'true') {
        await use(EMPTY_SCENARIO_CONTEXT)
        return
      }

      // Auto-tag the test with its scenario's domain so --grep filters can
      // target specific domains. We still read the JSON file here even
      // though provisioning is now done upfront in e2e-setup — it's a
      // one-time per-worker file read.
      const scenarioPath = resolve(process.cwd(), 'e2e/scenarios', `${scenarioId}.json`)
      if (existsSync(scenarioPath)) {
        const scenarioJson = JSON.parse(readFileSync(scenarioPath, 'utf-8')) as {
          domain?: string
        }
        if (scenarioJson.domain) {
          testInfo.annotations.push({ type: 'tag', description: `@${scenarioJson.domain}` })
        }
      }

      // Look up the pre-provisioned context. globalSetup wrote
      // e2e/.e2e-scenarios.json; if the lookup fails, the message lists
      // available scenarios so the typo is obvious.
      const lookupStart = Date.now()
      const ctx = _scenariosMap.get(scenarioId)
      if (!ctx) {
        const available = [..._scenariosMap.keys()].join(', ') || '(none)'
        throw new Error(
          `Scenario "${scenarioId}" not found in e2e/.e2e-scenarios.json. ` +
            `Did e2e-setup provision it? Available scenarios: ${available}`,
        )
      }

      testInfo.annotations.push({
        type: 'timing',
        description: JSON.stringify({
          phase: 'provisioning',
          durationMs: Date.now() - lookupStart,
          cacheHit: true,
        }),
      })

      await use(ctx)
    },
    { scope: 'test' },
  ],

  page: async ({ page, localConfig, scenario }, use, testInfo) => {
    // `@gusto/embedded-api` validates every response with Zod and wraps Zod
    // failures in `SDKValidationError`. When the backend ships a shape that
    // disagrees with the published schema, the SDK surfaces this either as
    // an uncaught page error or via React's error-boundary `console.error`.
    // Tests can otherwise pass while the SDK is silently crashing mid-flow,
    // so we fail the test if any such error fires during its lifetime. See
    // `validationErrorCollector` for the detection contract and tests.
    const validationErrors = createValidationErrorCollector(page)

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

    const collected = validationErrors.getErrors()
    if (collected.length > 0) {
      const detail = validationErrors.format()
      await testInfo.attach('validation-errors.txt', {
        body: detail,
        contentType: 'text/plain',
      })
      // Only fail the test if it would otherwise pass — if it already failed
      // for another reason, surface the validation errors as an attachment
      // but don't overwrite the existing failure.
      if (testInfo.status === 'passed' || testInfo.status === undefined) {
        throw new Error(
          `Detected ${collected.length} response-shape validation error(s) in the browser ` +
            `console during this test. This means the backend returned a response shape that ` +
            `disagrees with the @gusto/embedded-api Zod schema. See the validation-errors.txt ` +
            `attachment for the full text.\n\n${detail}`,
        )
      }
    }
  },
})

export { expect } from '@playwright/test'
