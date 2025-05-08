import type { Story } from '@ladle/react'
import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/List/Unordered',
}

// Wrapper component to provide context
const WithComponentsProvider = ({ children }: { children: ReactNode }) => (
  <ComponentsProvider value={defaultComponents}>{children}</ComponentsProvider>
)

export const SimpleList: Story = () => {
  const Components = useComponentContext()

  return (
    <WithComponentsProvider>
      <Components.UnorderedList
        items={[
          'First item',
          'Second item',
          'Third item',
          'Fourth item with slightly longer text to demonstrate wrapping',
        ]}
      />
    </WithComponentsProvider>
  )
}

export const WithComplexContent: Story = () => {
  const Components = useComponentContext()

  return (
    <WithComponentsProvider>
      <Components.UnorderedList
        items={[
          <div key="item-1">
            <strong>Important note</strong>
            <p>This is an important first item with additional details.</p>
          </div>,
          <div key="item-2">
            <strong>Task</strong>
            <p>This item contains a task that needs to be completed.</p>
          </div>,
          <div key="item-3">
            Item with a badge <Badge status="success">Complete</Badge>
          </div>,
        ]}
      />
    </WithComponentsProvider>
  )
}

export const WithCustomClass: Story = () => {
  const Components = useComponentContext()

  return (
    <WithComponentsProvider>
      <Components.UnorderedList
        className="custom-list-class"
        items={['Item with custom class applied to the list element']}
      />
    </WithComponentsProvider>
  )
}

export const NestedLists: Story = () => {
  const Components = useComponentContext()

  return (
    <WithComponentsProvider>
      <Components.UnorderedList
        items={[
          'First level item 1',
          <>
            First level item 2
            <Components.UnorderedList
              items={[
                'Second level item 1',
                'Second level item 2',
                <>
                  Second level item 3
                  <Components.OrderedList
                    items={['Third level item 1', 'Third level item 2', 'Third level item 3']}
                  />
                </>,
              ]}
            />
          </>,
          'First level item 3',
        ]}
      />
    </WithComponentsProvider>
  )
}
