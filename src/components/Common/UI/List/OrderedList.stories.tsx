import type { Story } from '@ladle/react'
import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/List/Ordered',
}

// Wrapper component to provide context
const WithComponentsProvider = ({ children }: { children: ReactNode }) => (
  <ComponentsProvider value={defaultComponents}>{children}</ComponentsProvider>
)

// Component that uses Components pattern for accessing context
const OrderedListStory = () => {
  const Components = useComponentContext()

  return (
    <Components.OrderedList
      items={[
        'First item',
        'Second item',
        'Third item',
        'Fourth item with slightly longer text to demonstrate wrapping',
      ]}
    />
  )
}

export const SimpleList: Story = () => {
  return (
    <WithComponentsProvider>
      <OrderedListStory />
    </WithComponentsProvider>
  )
}

// Component for complex content example
const ComplexContentStory = () => {
  const Components = useComponentContext()

  return (
    <Components.OrderedList
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
  )
}

export const WithComplexContent: Story = () => {
  return (
    <WithComponentsProvider>
      <ComplexContentStory />
    </WithComponentsProvider>
  )
}

// Component for custom class example
const CustomClassStory = () => {
  const Components = useComponentContext()

  return (
    <Components.OrderedList
      className="custom-list-class"
      items={['Item with custom class applied to the list element']}
    />
  )
}

export const WithCustomClass: Story = () => {
  return (
    <WithComponentsProvider>
      <CustomClassStory />
    </WithComponentsProvider>
  )
}

// Component for nested lists example
const NestedListsStory = () => {
  const Components = useComponentContext()

  return (
    <Components.OrderedList
      items={[
        'Major step 1',
        <>
          Major step 2
          <Components.OrderedList
            items={[
              'Sub-step 1',
              'Sub-step 2',
              <>
                Sub-step 3
                <Components.UnorderedList items={['Note 1', 'Note 2', 'Note 3']} />
              </>,
            ]}
          />
        </>,
        'Major step 3',
      ]}
    />
  )
}

export const NestedLists: Story = () => {
  return (
    <WithComponentsProvider>
      <NestedListsStory />
    </WithComponentsProvider>
  )
}
