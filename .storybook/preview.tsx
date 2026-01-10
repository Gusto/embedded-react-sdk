import type { Decorator, Preview } from '@storybook/react'
import { GustoProviderCustomUIAdapter } from '@/contexts'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { PlainComponentAdapter } from './adapters/PlainComponentAdapter'
import '../src/styles/sdk.scss'

interface StoryContext {
  globals: {
    componentAdapter?: 'default' | 'plain'
  }
}

const withProviders: Decorator = (Story, context: StoryContext) => {
  const adapterMode = context.globals.componentAdapter || 'default'
  const components = adapterMode === 'plain' ? PlainComponentAdapter : defaultComponents

  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '' }}
      components={components}
      locale="en-US"
      currency="USD"
    >
      <Story />
    </GustoProviderCustomUIAdapter>
  )
}

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    componentAdapter: {
      name: 'Component Adapter',
      description: 'Switch between React Aria and Plain HTML components',
      defaultValue: 'default',
      toolbar: {
        icon: 'component',
        items: [
          { value: 'default', title: 'React Aria' },
          { value: 'plain', title: 'Plain HTML' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
