import { test as base } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { ScenarioContext } from '../scenario/cache'
import { provisionScenario } from '../scenario/runner'

interface E2EState {
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

export const test = base.extend<ScenarioFixtures & { localConfig: LocalConfig }>({
  localConfig: [
    async ({}, use) => {
      const isLocal = process.env.E2E_LOCAL === 'true'
      const dynamicState = isLocal ? loadDynamicState() : {}

      const config: LocalConfig = {
        isLocal,
        flowToken: process.env.E2E_FLOW_TOKEN || '',
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
    async ({}, use, testInfo) => {
      const annotation = testInfo.annotations.find(a => a.type === 'scenario')
      if (!annotation?.description) {
        await use(EMPTY_SCENARIO_CONTEXT)
        return
      }

      const scenarioPath = resolve(process.cwd(), 'e2e/scenarios', `${annotation.description}.json`)
      const scenarioJson = JSON.parse(readFileSync(scenarioPath, 'utf-8')) as {
        domain?: string
      }
      if (scenarioJson.domain) {
        testInfo.annotations.push({ type: 'tag', description: `@${scenarioJson.domain}` })
      }

      if (process.env.E2E_LOCAL !== 'true') {
        await use(EMPTY_SCENARIO_CONTEXT)
        return
      }

      const ctx = await provisionScenario(scenarioPath)
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
        if (firstEmployee) params.set('employeeId', firstEmployee)

        const firstContractor = Object.values(scenario.contractorIds)[0]
        if (firstContractor) params.set('contractorId', firstContractor)

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
