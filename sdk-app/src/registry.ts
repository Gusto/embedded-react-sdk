import { ENTITY_REQUIREMENTS, ADDITIONAL_REQUIRED_PROPS } from './generated-registry-data'
import * as CompanyOnboarding from '@/components/Company/exports/companyOnboarding'
import * as ContractorManagement from '@/components/Contractor/exports/contractorManagement'
import * as ContractorOnboarding from '@/components/Contractor/exports/contractorOnboarding'
import * as EmployeeManagement from '@/components/Employee/exports/employeeManagement'
import * as EmployeeOnboarding from '@/components/Employee/exports/employeeOnboarding'
import * as Payroll from '@/components/Payroll'
import * as InformationRequests from '@/components/InformationRequests'
import * as TimeOff from '@/components/TimeOff'

export type Category =
  | 'CompanyOnboarding'
  | 'ContractorManagement'
  | 'ContractorOnboarding'
  | 'EmployeeManagement'
  | 'EmployeeOnboarding'
  | 'Payroll'
  | 'InformationRequests'
  | 'TimeOff'

export interface ComponentEntry {
  name: string
  category: Category
  component: React.ComponentType<Record<string, unknown>>
  requiredEntityIds: string[]
  additionalRequiredProps: string[]
}

const namespaces: Record<Category, Record<string, unknown>> = {
  CompanyOnboarding,
  ContractorManagement,
  ContractorOnboarding,
  EmployeeManagement,
  EmployeeOnboarding,
  Payroll,
  InformationRequests,
  TimeOff,
}

function isReactComponent(value: unknown): value is React.ComponentType<Record<string, unknown>> {
  return typeof value === 'function'
}

function buildRegistry(): ComponentEntry[] {
  const entries: ComponentEntry[] = []

  for (const [category, namespace] of Object.entries(namespaces)) {
    for (const [name, value] of Object.entries(namespace)) {
      if (!isReactComponent(value)) continue

      const key = `${category}.${name}`
      if (!(key in ENTITY_REQUIREMENTS)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[SDK Dev App] Component "${key}" is not in generated registry data. ` +
            `Defaulting to ['companyId']. Run: npx tsx sdk-app/scripts/analyze-component-props.ts`,
        )
      }

      entries.push({
        name,
        category: category as Category,
        component: value,
        requiredEntityIds: ENTITY_REQUIREMENTS[key] || ['companyId'],
        additionalRequiredProps: ADDITIONAL_REQUIRED_PROPS[key] || [],
      })
    }
  }

  return entries
}

export const componentRegistry = buildRegistry()

export const categorizedRegistry: Record<Category, ComponentEntry[]> = {
  CompanyOnboarding: [],
  ContractorManagement: [],
  ContractorOnboarding: [],
  EmployeeManagement: [],
  EmployeeOnboarding: [],
  Payroll: [],
  InformationRequests: [],
  TimeOff: [],
}

for (const entry of componentRegistry) {
  categorizedRegistry[entry.category].push(entry)
}

export const CATEGORIES: Category[] = [
  'CompanyOnboarding',
  'EmployeeManagement',
  'EmployeeOnboarding',
  'ContractorOnboarding',
  'ContractorManagement',
  'Payroll',
  'InformationRequests',
  'TimeOff',
]

export function findComponent(category: string, name: string): ComponentEntry | undefined {
  return componentRegistry.find(
    e => e.category.toLowerCase() === category.toLowerCase() && e.name === name,
  )
}
