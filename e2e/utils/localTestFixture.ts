import { test as base } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

interface E2EState {
  companyId: string
  employeeId: string
  contractorId: string
  locationId: string
}

interface LocalConfig {
  isLocal: boolean
  flowToken: string
  companyId: string
  employeeId: string
  contractorId: string
  locationId: string
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
      const dynamicState = loadDynamicState()

      const config: LocalConfig = {
        isLocal: process.env.E2E_LOCAL === 'true',
        flowToken: process.env.E2E_FLOW_TOKEN || '',
        companyId: dynamicState.companyId || process.env.E2E_COMPANY_ID || '123',
        employeeId: dynamicState.employeeId || process.env.E2E_EMPLOYEE_ID || '456',
        contractorId: dynamicState.contractorId || '789',
        locationId: dynamicState.locationId || '',
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

      if (localConfig.isLocal && localConfig.flowToken) {
        params.set('local', 'true')
        params.set('flowToken', localConfig.flowToken)
      }

      if (!params.has('companyId') || params.get('companyId') === '123') {
        params.set('companyId', localConfig.companyId)
      }
      if (!params.has('employeeId') || params.get('employeeId') === '456') {
        params.set('employeeId', localConfig.employeeId)
      }
      if (!params.has('contractorId') || params.get('contractorId') === '789') {
        params.set('contractorId', localConfig.contractorId)
      }

      const newUrl = `${parsedUrl.pathname}?${params.toString()}`
      return originalGoto(newUrl, options)
    }

    await use(page)
  },
})

export { expect } from '@playwright/test'
