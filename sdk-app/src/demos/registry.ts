import type { ComponentType } from 'react'
import WorkflowDemo from './WorkflowDemo'
import CompositionDemo from './CompositionDemo'
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
