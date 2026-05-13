import type { ComponentType } from 'react'
import WorkflowDemo from './WorkflowDemo'
import CompositionDemo from './CompositionDemo'
import IndividualComponentsDemo from './IndividualComponentsDemo'
import HooksHelloDemo from './HooksHelloDemo'
import HooksBasicDemo from './HooksBasicDemo'
import HooksCustomFieldDemo from './HooksCustomFieldDemo'
import HooksChainedDemo from './HooksChainedDemo'
import HooksInterleavedDemo from './HooksInterleavedDemo'
import HooksEmployeeListDemo from './HooksEmployeeListDemo'
import HooksPayScheduleDemo from './HooksPayScheduleDemo'
import ThemeDemo from './ThemeDemo'
import AdaptersDemo from './AdaptersDemo'
import TranslationsDemo from './TranslationsDemo'
import EventsDemo from './EventsDemo'
import DefaultValuesDemo from './DefaultValuesDemo'
import ResponsiveDemo from './ResponsiveDemo'

export interface DemoEntry {
  id: string
  label: string
  component: ComponentType
}

export const DEMO_ROUTE_PREFIX = '/demos'

export const DEMOS: DemoEntry[] = [
  { id: 'workflow', label: 'Workflow', component: WorkflowDemo },
  { id: 'composition', label: 'Composition', component: CompositionDemo },
  {
    id: 'individual-components',
    label: 'Individual Components',
    component: IndividualComponentsDemo,
  },
  { id: 'hooks-hello', label: 'Hooks: Hello', component: HooksHelloDemo },
  { id: 'hooks-basic', label: 'Hooks: Basic', component: HooksBasicDemo },
  { id: 'hooks-custom-field', label: 'Hooks: Custom Field', component: HooksCustomFieldDemo },
  { id: 'hooks-chained', label: 'Hooks: Chained', component: HooksChainedDemo },
  { id: 'hooks-interleaved', label: 'Hooks: Interleaved', component: HooksInterleavedDemo },
  { id: 'hooks-employee-list', label: 'Hooks: Employee List', component: HooksEmployeeListDemo },
  { id: 'hooks-pay-schedule', label: 'Hooks: Pay Schedule', component: HooksPayScheduleDemo },
  { id: 'theme', label: 'Theming', component: ThemeDemo },
  { id: 'adapters', label: 'Component Adapters', component: AdaptersDemo },
  { id: 'translations', label: 'Translations', component: TranslationsDemo },
  { id: 'events', label: 'Events', component: EventsDemo },
  { id: 'defaults', label: 'Default Values', component: DefaultValuesDemo },
  { id: 'responsive', label: 'Responsive', component: ResponsiveDemo },
]

export function findDemo(id: string | undefined): DemoEntry | undefined {
  return DEMOS.find(d => d.id === id)
}
