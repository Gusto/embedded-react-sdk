import type { Story } from '@ladle/react'
import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import type { UnorderedListProps } from './ListTypes'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/List/Unordered',
}

// Component that uses the context
const UnorderedListFromContext = ({ items, className, ...props }: UnorderedListProps) => {
  const { UnorderedList } = useComponentContext()
  return <UnorderedList items={items} className={className} {...props} />
}

// Wrapper component to provide context
const WithComponentsProvider = ({ children }: { children: ReactNode }) => (
  <ComponentsProvider value={defaultComponents}>{children}</ComponentsProvider>
)

export const SimpleList: Story = () => {
  return (
    <WithComponentsProvider>
      <UnorderedListFromContext
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
  return (
    <WithComponentsProvider>
      <UnorderedListFromContext
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
  return (
    <WithComponentsProvider>
      <UnorderedListFromContext
        className="custom-list-class"
        items={['Item with custom class applied to the list element']}
      />
    </WithComponentsProvider>
  )
}

export const NestedLists: Story = () => {
  return (
    <WithComponentsProvider>
      <NestedListsExample />
    </WithComponentsProvider>
  )
}

// Separated component to access context inside WithComponentsProvider
const NestedListsExample = () => {
  const { OrderedList, UnorderedList } = useComponentContext()

  return (
    <UnorderedList
      items={[
        'First level item 1',
        <>
          First level item 2
          <UnorderedList
            items={[
              'Second level item 1',
              'Second level item 2',
              <>
                Second level item 3
                <OrderedList
                  items={['Third level item 1', 'Third level item 2', 'Third level item 3']}
                />
              </>,
            ]}
          />
        </>,
        'First level item 3',
      ]}
    />
  )
}
