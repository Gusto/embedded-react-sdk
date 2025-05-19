import type { Story } from '@ladle/react'
import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { ReorderableList } from './ReorderableList'
import { LocaleProvider } from '@/contexts/LocaleProvider/LocaleProvider'
import { SDKI18next } from '@/contexts/GustoProvider/SDKI18next'

// Centralized wrapper for all stories
function GustoMockProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={SDKI18next}>
      <LocaleProvider locale="en-US" currency="USD">
        {children}
      </LocaleProvider>
    </I18nextProvider>
  )
}

export default {
  title: 'UI/Components/ReorderableList',
}

// Shared styles for all examples
const itemStyles = {
  red: {
    padding: '10px',
    background: '#ffcccc',
    border: '1px solid #cc0000',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  green: {
    padding: '10px',
    background: '#ccffcc',
    border: '1px solid #00cc00',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  blue: {
    padding: '10px',
    background: '#ccccff',
    border: '1px solid #0000cc',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  yellow: {
    padding: '10px',
    background: '#ffffcc',
    border: '1px solid #cccc00',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
  },
}

/**
 * Basic example of ReorderableList - stripped down to essentials
 */
export const Basic: Story = () => {
  const coloredItems = [
    <div key="item-0" style={itemStyles.red}>
      <strong>Item A (red)</strong>
      <span>Original Index: 0</span>
    </div>,
    <div key="item-1" style={itemStyles.green}>
      <strong>Item B (green)</strong>
      <span>Original Index: 1</span>
    </div>,
    <div key="item-2" style={itemStyles.blue}>
      <strong>Item C (blue)</strong>
      <span>Original Index: 2</span>
    </div>,
    <div key="item-3" style={itemStyles.yellow}>
      <strong>Item D (yellow)</strong>
      <span>Original Index: 3</span>
    </div>,
  ]

  // State to track the current order
  const [currentOrder, setCurrentOrder] = useState<number[]>([0, 1, 2, 3])

  // Order control functions
  const resetOrder = () => {
    setCurrentOrder([0, 1, 2, 3])
  }
  const setProblemOrder = () => {
    setCurrentOrder([1, 2, 0, 3])
  }

  return (
    <GustoMockProvider>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Reorderable List Demo</h2>
        <p>
          Drag items to reorder or use keyboard navigation. The table shows the current order state.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={resetOrder} style={{ padding: '8px 12px' }}>
            Reset to Default
          </button>
          <button onClick={setProblemOrder} style={{ padding: '8px 12px' }}>
            Test Problem Order [1,2,0,3]
          </button>
        </div>

        {/* Order state display */}
        <div style={{ marginBottom: '20px', fontFamily: 'monospace' }}>
          <h3>Current Order State:</h3>
          <code
            style={{ fontSize: '16px', background: '#f0f0f0', padding: '5px', display: 'block' }}
          >
            [{currentOrder.join(', ')}]
          </code>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '10px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Position</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Item Index</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Expected Item</th>
              </tr>
            </thead>
            <tbody>
              {currentOrder.map((itemIndex, position) => (
                <tr key={position}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{position}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{itemIndex}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {['Item A (red)', 'Item B (green)', 'Item C (blue)', 'Item D (yellow)'][
                      itemIndex
                    ] || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            background: '#f9f9f9',
          }}
        >
          <ReorderableList
            items={[
              { label: 'Item A (red)', content: coloredItems[0]! },
              { label: 'Item B (green)', content: coloredItems[1]! },
              { label: 'Item C (blue)', content: coloredItems[2]! },
              { label: 'Item D (yellow)', content: coloredItems[3]! },
            ]}
            label="Reorderable items"
            onReorder={setCurrentOrder}
          />
        </div>
      </div>
    </GustoMockProvider>
  )
}

/**
 * Simple Example with Keyboard Navigation Emphasized
 */
export const KeyboardNavigation: Story = () => {
  const simpleItems = [
    <div key="kb-1" style={{ padding: '10px', background: '#f0f0f0', marginBottom: '5px' }}>
      Item 1
    </div>,
    <div key="kb-2" style={{ padding: '10px', background: '#f0f0f0', marginBottom: '5px' }}>
      Item 2
    </div>,
    <div key="kb-3" style={{ padding: '10px', background: '#f0f0f0', marginBottom: '5px' }}>
      Item 3
    </div>,
    <div key="kb-4" style={{ padding: '10px', background: '#f0f0f0', marginBottom: '5px' }}>
      Item 4
    </div>,
  ]

  const [order, setOrder] = useState<number[]>([0, 1, 2, 3])

  return (
    <GustoMockProvider>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Keyboard Navigation</h2>
        <p>This example emphasizes keyboard navigation. Try using:</p>
        <ul>
          <li>
            <strong>Tab</strong>: Focus on drag handles
          </li>
          <li>
            <strong>Space/Enter</strong>: Start/stop reordering mode
          </li>
          <li>
            <strong>Arrow Up/Down</strong>: Move items when in reordering mode
          </li>
          <li>
            <strong>Escape</strong>: Cancel reordering
          </li>
        </ul>

        <div
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            background: '#f9f9f9',
            marginTop: '20px',
          }}
        >
          <ReorderableList
            items={[
              { label: 'Item 1', content: simpleItems[0]! },
              { label: 'Item 2', content: simpleItems[1]! },
              { label: 'Item 3', content: simpleItems[2]! },
              { label: 'Item 4', content: simpleItems[3]! },
            ]}
            label="Keyboard navigation demo"
            onReorder={setOrder}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Current Order:</h3>
          <code>{JSON.stringify(order)}</code>
        </div>
      </div>
    </GustoMockProvider>
  )
}
