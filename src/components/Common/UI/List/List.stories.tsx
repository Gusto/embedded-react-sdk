import { List } from './List'
import { TestList } from './TestList'

export default {
  title: 'UI/Components/List/List',
}

export const Default = () => <List items={['First item', 'Second item', 'Third item']} />

export const WithCustomContent = () => (
  <List
    items={[
      <span key="1">
        Item with <strong>bold text</strong>
      </span>,
      <span key="2">
        Item with <em>italic text</em>
      </span>,
    ]}
  />
)

export const SingleItem = () => <List items={['Only one item']} />

export const ManyItems = () => (
  <List
    items={[
      'First item',
      'Second item',
      'Third item',
      'Fourth item',
      'Fifth item',
      'Sixth item',
      'Seventh item',
    ]}
  />
)

export const WithAriaLabel = () => (
  <List items={['Item 1', 'Item 2', 'Item 3']} aria-label="Example list" />
)

export const TestComponent = () => <TestList />
