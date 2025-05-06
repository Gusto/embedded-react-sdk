import type { Story } from '@ladle/react'
import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import type { OrderedListProps } from './ListTypes'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/List/Ordered',
}

// Component that uses the context
const OrderedListFromContext = ({ items, className, ...props }: OrderedListProps) => {
  const { OrderedList } = useComponentContext()
  return <OrderedList items={items} className={className} {...props} />
}

// Wrapper component to provide context
const WithComponentsProvider = ({ children }: { children: ReactNode }) => (
  <ComponentsProvider value={defaultComponents}>{children}</ComponentsProvider>
)

export const SimpleList: Story = () => {
  return (
    <WithComponentsProvider>
      <OrderedListFromContext
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
      <OrderedListFromContext
        items={[
          <div key="item-1">
            <strong>Step 1</strong>
            <p>Complete this first step before continuing.</p>
          </div>,
          <div key="item-2">
            <strong>Step 2</strong>
            <p>After completing step 1, proceed to this step.</p>
          </div>,
          <div key="item-3">
            Complete the process <Badge status="success">Final Step</Badge>
          </div>,
        ]}
      />
    </WithComponentsProvider>
  )
}

export const WithCustomClass: Story = () => {
  return (
    <WithComponentsProvider>
      <OrderedListFromContext
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
    <OrderedList
      items={[
        'Major step 1',
        <>
          Major step 2
          <OrderedList
            items={[
              'Sub-step 1',
              'Sub-step 2',
              <>
                Sub-step 3
                <UnorderedList items={['Note 1', 'Note 2', 'Note 3']} />
              </>,
            ]}
          />
        </>,
        'Major step 3',
      ]}
    />
  )
}
