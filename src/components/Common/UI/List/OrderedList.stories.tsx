import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/List/Ordered',
}

export const SimpleList = () => {
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

export const WithComplexContent = () => {
  const Components = useComponentContext()

  return (
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
          <strong>Step 3</strong>
          <Components.Text>Complete the final step of the process.</Components.Text>
        </div>,
      ]}
    />
  )
}

export const WithCustomClass = () => {
  const Components = useComponentContext()

  return (
    <Components.OrderedList
      className="custom-list-class"
      items={['Item with custom class applied to the list element']}
    />
  )
}

export const NestedLists = () => {
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

export const SingleItem = () => {
  const Components = useComponentContext()

  return <Components.OrderedList items={['Single item in the list']} />
}

export const WithAccessibilityLabels = () => {
  const Components = useComponentContext()

  return (
    <Components.OrderedList
      aria-label="Step-by-step instructions"
      items={[
        'Read the instructions carefully',
        'Gather all required materials',
        'Follow each step in order',
        'Verify the results',
      ]}
    />
  )
}
