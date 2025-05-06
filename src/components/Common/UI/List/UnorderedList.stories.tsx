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

// Component that uses Components pattern for accessing context
const UnorderedListStory = () => {
  const Components = useComponentContext()

  return (
    <Components.UnorderedList
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
      <UnorderedListStory />
    </WithComponentsProvider>
  )
}

// Component for complex content example
const ComplexContentStory = () => {
  const Components = useComponentContext()

  return (
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
    <Components.UnorderedList
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
  )
}

export const NestedLists: Story = () => {
  return (
    <WithComponentsProvider>
      <NestedListsStory />
    </WithComponentsProvider>
  )
}
