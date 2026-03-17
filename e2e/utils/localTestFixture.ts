import { test as base } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

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

function loadDynamicState(): Partial<E2EState> {
  const statePath = resolve(process.cwd(), 'e2e/.e2e-state.json')
  if (existsSync(statePath)) {
    const content = readFileSync(statePath, 'utf-8')
    return JSON.parse(content)
  }
  return {}
}

export const test = base.extend<{ localConfig: LocalConfig }>({
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

  page: async ({ page, localConfig }, use) => {
    const originalGoto = page.goto.bind(page)

    page.goto = async (url: string, options?: Parameters<typeof page.goto>[1]) => {
      const parsedUrl = new URL(url, 'http://localhost:5173')
      const params = parsedUrl.searchParams

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

      const newUrl = `${parsedUrl.pathname}?${params.toString()}`
      return originalGoto(newUrl, options)
    }

    await use(page)
  },
})

export { expect } from '@playwright/test'
