import type { Story } from '@ladle/react'
import { Badge } from '../Badge/Badge'
import { List } from './List'

export default {
  title: 'UI/Components/List',
}

export const UnorderedList: Story = () => {
  return (
    <List
      items={[
        'First item',
        'Second item',
        'Third item',
        'Fourth item with slightly longer text to demonstrate wrapping',
      ]}
    />
  )
}

export const OrderedList: Story = () => {
  return (
    <List
      variant="ordered"
      items={[
        'First item',
        'Second item',
        'Third item',
        'Fourth item with slightly longer text to demonstrate wrapping',
      ]}
    />
  )
}

export const WithComplexContent: Story = () => {
  return (
    <List
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

export const NestedLists: Story = () => {
  return (
    <List
      items={[
        'First level item 1',
        <>
          First level item 2
          <List
            items={[
              'Second level item 1',
              'Second level item 2',
              <>
                Second level item 3
                <List
                  variant="ordered"
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
