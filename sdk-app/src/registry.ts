import { ENTITY_REQUIREMENTS, ADDITIONAL_REQUIRED_PROPS } from './generated-registry-data'
import * as Company from '@/components/Company'
import * as Contractor from '@/components/Contractor'
import * as Employee from '@/components/Employee'
import * as Payroll from '@/components/Payroll'
import * as InformationRequests from '@/components/InformationRequests'
import * as UNSTABLE_TimeOff from '@/components/UNSTABLE_TimeOff'

export type Category =
  | 'Company'
  | 'Contractor'
  | 'Employee'
  | 'Payroll'
  | 'InformationRequests'
  | 'UNSTABLE_TimeOff'

export interface ComponentEntry {
  name: string
  category: Category
  component: React.ComponentType<Record<string, unknown>>
  requiredEntityIds: string[]
  additionalRequiredProps: string[]
}

const namespaces: Record<Category, Record<string, unknown>> = {
  Company,
  Contractor,
  Employee,
  Payroll,
  InformationRequests,
  UNSTABLE_TimeOff,
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
  Company: [],
  Contractor: [],
  Employee: [],
  Payroll: [],
  InformationRequests: [],
  UNSTABLE_TimeOff: [],
}

for (const entry of componentRegistry) {
  categorizedRegistry[entry.category].push(entry)
}

export const CATEGORIES: Category[] = [
  'Company',
  'Employee',
  'Contractor',
  'Payroll',
  'InformationRequests',
  'UNSTABLE_TimeOff',
]

export function findComponent(category: string, name: string): ComponentEntry | undefined {
  return componentRegistry.find(
    e => e.category.toLowerCase() === category.toLowerCase() && e.name === name,
  )
}
