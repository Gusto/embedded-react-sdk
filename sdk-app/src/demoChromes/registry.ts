import { AcmeHrChrome } from './AcmeHrChrome'
import { InterfaceLibChrome } from './InterfaceLibChrome'
import type { DemoChromeEntry } from './types'

export const SDK_NATIVE_CHROME_ID = 'sdk-native'

export const demoChromes: DemoChromeEntry[] = [
  {
    id: SDK_NATIVE_CHROME_ID,
    label: 'SDK Dev App (default)',
    description: 'The standard SDK dev app chrome — TopBar, Sidebar, Events Log.',
    Chrome: () => null,
  },
  {
    id: 'acme-hr',
    label: 'Acme HR (partner demo)',
    description: 'Generic partner-styled chrome with branded header, left nav, and footer.',
    Chrome: AcmeHrChrome,
  },
  {
    id: 'interface-lib',
    label: 'InterfaceLib (partner demo)',
    description:
      'Minimal partner chrome built on the InterfaceLib design language — black top nav, light sidebar with blue accent, custom Sans font.',
    Chrome: InterfaceLibChrome,
  },
]

export function findDemoChrome(id: string | undefined): DemoChromeEntry | undefined {
  return demoChromes.find(c => c.id === id)
}
