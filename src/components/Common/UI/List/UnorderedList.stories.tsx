import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/List/Unordered',
}

export const SimpleList = () => {
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

export const WithComplexContent = () => {
  const Components = useComponentContext()

  return (
    <Components.UnorderedList
      items={[
        <div key="item-1">
          <strong>Important note</strong>
          <Components.Text>
            This is an important first item with additional details.
          </Components.Text>
        </div>,
        <div key="item-2">
          <strong>Task</strong>
          <Components.Text>This item contains a task that needs to be completed.</Components.Text>
        </div>,
        <div key="item-3">
          <strong>Reminder</strong>
          <Components.Text>Remember to follow up on these items.</Components.Text>
        </div>,
      ]}
    />
  )
}

export const WithCustomClass = () => {
  const Components = useComponentContext()

  return (
    <Components.UnorderedList
      className="custom-list-class"
      items={['Item with custom class applied to the list element']}
    />
  )
}

export const NestedLists = () => {
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

export const SingleItem = () => {
  const Components = useComponentContext()

  return <Components.UnorderedList items={['Single item in the list']} />
}

export const WithAccessibilityLabels = () => {
  const Components = useComponentContext()

  return (
    <Components.UnorderedList
      aria-label="Feature list"
      items={[
        'Easy to use interface',
        'Responsive design',
        'Accessible to all users',
        'Fast performance',
      ]}
    />
  )
}
