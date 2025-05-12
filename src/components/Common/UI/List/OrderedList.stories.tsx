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

export const SimpleList: Story = () => {
  const Components = useComponentContext()
  return (
    <WithComponentsProvider>
      <Components.OrderedList
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
      <Components.OrderedList
        items={[
          <div key="item-1">
            <strong>Step 1</strong>
            <Components.Text>Complete this first step before continuing.</Components.Text>
          </div>,
          <div key="item-2">
            <strong>Step 2</strong>
            <Components.Text>After completing step 1, proceed to this step.</Components.Text>
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
  const Components = useComponentContext()

  return (
    <WithComponentsProvider>
      <Components.OrderedList
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
    </WithComponentsProvider>
  )
}
