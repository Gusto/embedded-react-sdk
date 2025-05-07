import type { Story } from '@ladle/react'
import { useState, type ReactElement } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import enCommon from '@/i18n/en/common.json'
import { LocaleProvider } from '@/contexts/LocaleProvider/LocaleProvider'

// Initialize i18n for stories
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        common: enCommon,
      },
    },
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })
}

// Centralized wrapper for all stories
function GustoMockProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LocaleProvider locale="en-US" currency="USD">
        {children}
      </LocaleProvider>
    </I18nextProvider>
  )
}

export default {
  title: 'UI/Components/ReorderableList',
}

/**
 * Basic example of ReorderableList - stripped down to essentials
 */
export const Basic: Story = () => {
  const Components = useComponentContext()

  // Simple items list with distinct visuals
  const [items] = useState([
    <div
      key="item-0"
      style={{
        padding: '10px',
        background: '#ffcccc',
        margin: '5px 0',
        border: '1px solid #cc0000',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <strong>Item A (red)</strong>
      <span>Original Index: 0</span>
    </div>,
    <div
      key="item-1"
      style={{
        padding: '10px',
        background: '#ccffcc',
        margin: '5px 0',
        border: '1px solid #00cc00',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <strong>Item B (green)</strong>
      <span>Original Index: 1</span>
    </div>,
    <div
      key="item-2"
      style={{
        padding: '10px',
        background: '#ccccff',
        margin: '5px 0',
        border: '1px solid #0000cc',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <strong>Item C (blue)</strong>
      <span>Original Index: 2</span>
    </div>,
    <div
      key="item-3"
      style={{
        padding: '10px',
        background: '#ffffcc',
        margin: '5px 0',
        border: '1px solid #cccc00',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <strong>Item D (yellow)</strong>
      <span>Original Index: 3</span>
    </div>,
  ])

  // State to track the current order
  const [currentOrder, setCurrentOrder] = useState<number[]>([0, 1, 2, 3])

  // Reset function for testing
  const resetOrder = () => {
    setCurrentOrder([0, 1, 2, 3])
  }

  // Test case for the problematic order
  const setProblemOrder = () => {
    setCurrentOrder([1, 2, 0, 3])
  }

  // A simple visual representation of the order
  const orderDisplay = (
    <div style={{ marginBottom: '20px', fontFamily: 'monospace' }}>
      <h3>Current Order State:</h3>
      <code style={{ fontSize: '16px', background: '#f0f0f0', padding: '5px', display: 'block' }}>
        [{currentOrder.join(', ')}]
      </code>

      <table
        style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}
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
                {itemIndex === 0
                  ? 'Item A (red)'
                  : itemIndex === 1
                    ? 'Item B (green)'
                    : itemIndex === 2
                      ? 'Item C (blue)'
                      : itemIndex === 3
                        ? 'Item D (yellow)'
                        : 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <GustoMockProvider>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Reorderable List Test</h2>
        <p>
          Drag items to reorder. The visual list below should match the expected order in the table
          above.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={resetOrder} style={{ padding: '8px 12px' }}>
            Reset to Default
          </button>
          <button onClick={setProblemOrder} style={{ padding: '8px 12px' }}>
            Test Problem Order [1,2,0,3]
          </button>
        </div>

        {orderDisplay}

        <div
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            background: '#f9f9f9',
          }}
        >
          <Components.ReorderableList
            items={[
              {
                label: 'Item A (red)',
                content: items[0]!,
              },
              {
                label: 'Item B (green)',
                content: items[1]!,
              },
              {
                label: 'Item C (blue)',
                content: items[2]!,
              },
              {
                label: 'Item D (yellow)',
                content: items[3]!,
              },
            ]}
            label="Reorderable items"
            onReorder={newOrder => {
              // console.log('Reordered:', newOrder)
              setCurrentOrder(newOrder)
            }}
          />
        </div>
      </div>
    </GustoMockProvider>
  )
}

/**
 * Form Fields Example - demonstrates using ReorderableList with form fields
 */
export const WithFormFields: Story = () => {
  const Components = useComponentContext()

  // Sample form data for the fields
  const [formValues, setFormValues] = useState({
    field1: 'First field value',
    field2: 'Second field value',
    field3: 'Third field value',
  })

  // Current field priorities
  const [priorities, setPriorities] = useState<Record<string, number>>({
    field1: 1,
    field2: 2,
    field3: 3,
  })

  // Generate items from the form values
  const formItems = [
    <div key="field1" style={{ width: '100%' }}>
      <Components.TextInput
        label="Field 1"
        id="field1"
        name="field1"
        value={formValues.field1}
        onChange={val => {
          setFormValues({ ...formValues, field1: val })
        }}
      />
    </div>,
    <div key="field2" style={{ width: '100%' }}>
      <Components.TextInput
        label="Field 2"
        id="field2"
        name="field2"
        value={formValues.field2}
        onChange={val => {
          setFormValues({ ...formValues, field2: val })
        }}
      />
    </div>,
    <div key="field3" style={{ width: '100%' }}>
      <Components.TextInput
        label="Field 3"
        id="field3"
        name="field3"
        value={formValues.field3}
        onChange={val => {
          setFormValues({ ...formValues, field3: val })
        }}
      />
    </div>,
  ]

  const fieldsInPriorityOrder = Object.entries(priorities)
    .sort(([, priorityA], [, priorityB]) => priorityA - priorityB)
    .map(([fieldId]) => fieldId)

  const orderedItems = fieldsInPriorityOrder
    .map(fieldId => {
      const index = Number(fieldId.replace('field', '')) - 1
      return formItems[index]
    })
    .filter((item): item is ReactElement => item !== undefined)

  return (
    <GustoMockProvider>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Reorderable Form Fields</h2>
        <p>
          Demonstrates reordering form fields, similar to how you might arrange payment priorities.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h3>Current Field Order:</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px' }}>
            {JSON.stringify(priorities, null, 2)}
          </pre>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            background: '#f9f9f9',
            marginBottom: '20px',
          }}
        >
          <Components.ReorderableList
            items={fieldsInPriorityOrder
              .map((fieldId, index) => {
                const content = orderedItems[index]
                // Skip any items without valid content
                if (!content) return null
                return {
                  label: `Field ${fieldId.replace('field', '')}`,
                  content,
                }
              })
              .filter((item): item is { label: string; content: ReactElement } => item !== null)}
            label="Reorderable form fields"
            onReorder={newOrder => {
              // Calculate new priorities based on the new order
              const newPriorities = newOrder.reduce<Record<string, number>>(
                (acc, itemIndex, newPosition) => {
                  const fieldId = fieldsInPriorityOrder[itemIndex]
                  if (fieldId) {
                    return { ...acc, [fieldId]: newPosition + 1 }
                  }
                  return acc
                },
                {},
              )

              setPriorities(newPriorities)
            }}
          />
        </div>

        <div>
          <h3>Form Values:</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px' }}>
            {JSON.stringify(formValues, null, 2)}
          </pre>
        </div>
      </div>
    </GustoMockProvider>
  )
}

/**
 * Payment Split Example - similar to the implementation in Split.tsx
 */
export const PaymentSplit: Story = () => {
  const Components = useComponentContext()

  // Mock bank account data
  const bankAccounts = [
    { uuid: 'acct1', name: 'Checking Account', hiddenAccountNumber: '****1234' },
    { uuid: 'acct2', name: 'Savings Account', hiddenAccountNumber: '****5678' },
    { uuid: 'acct3', name: 'Secondary Checking', hiddenAccountNumber: '****9012' },
  ]

  type AmountValues = Record<string, number | null>

  // Track priorities for the accounts
  const [priorities, setPriorities] = useState<Record<string, number>>({
    acct1: 1,
    acct2: 2,
    acct3: 3,
  })

  // Calculate the remainder account (highest priority)
  const remainderId = Object.entries(priorities).reduce(
    (maxId, [uuid, priority]) => (!maxId || (priorities[maxId] ?? 0) < priority ? uuid : maxId),
    '',
  )

  // Track amount values
  const [amountValues, setAmountValues] = useState<AmountValues>({
    acct1: 500,
    acct2: 300,
    acct3: null, // null means "remainder"
  })

  // Generate form fields for each account
  const accountItems = bankAccounts.map(account => (
    <div key={account.uuid} style={{ width: '100%' }}>
      <Components.NumberInput
        label={`Amount for ${account.name} (${account.hiddenAccountNumber})`}
        id={`amount-${account.uuid}`}
        name={`amount.${account.uuid}`}
        value={amountValues[account.uuid] ?? undefined}
        placeholder={remainderId === account.uuid ? 'Remainder' : ''}
        isDisabled={remainderId === account.uuid}
        onChange={val => {
          setAmountValues(prev => ({ ...prev, [account.uuid]: val }))
        }}
      />
    </div>
  ))

  // Order accounts by priority
  const accountsInPriorityOrder = Object.entries(priorities)
    .sort(([, priorityA], [, priorityB]) => priorityA - priorityB)
    .map(([accountId]) => accountId)

  const orderedAccountItems = accountsInPriorityOrder
    .map(accountId => {
      const accountIndex = bankAccounts.findIndex(acct => acct.uuid === accountId)
      return accountIndex >= 0 ? accountItems[accountIndex] : undefined
    })
    .filter((item): item is ReactElement => item !== undefined)

  return (
    <GustoMockProvider>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Payment Split Example</h2>
        <p>
          This example demonstrates how the ReorderableList can be used to manage payment splits
          with a remainder account, similar to the implementation in Split.tsx.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h3>Current Payment Priorities:</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px' }}>
            {JSON.stringify(priorities, null, 2)}
          </pre>
          <p>Remainder account: {bankAccounts.find(a => a.uuid === remainderId)?.name || 'None'}</p>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            background: '#f9f9f9',
            marginBottom: '20px',
          }}
        >
          <Components.ReorderableList
            label="Payment split priorities"
            items={accountsInPriorityOrder
              .map((accountId, index) => {
                const account = bankAccounts.find(acct => acct.uuid === accountId)
                const content = orderedAccountItems[index]
                if (!content) return null
                return {
                  label: account
                    ? `${account.name} (${account.hiddenAccountNumber})`
                    : `Account ${accountId}`,
                  content,
                }
              })
              .filter((item): item is { label: string; content: ReactElement } => item !== null)}
            onReorder={newOrder => {
              // Calculate new priorities based on the new order
              const newPriorities = newOrder.reduce<Record<string, number>>(
                (acc, itemIndex, newPosition) => {
                  const accountId = accountsInPriorityOrder[itemIndex]
                  if (accountId) {
                    return { ...acc, [accountId]: newPosition + 1 }
                  }
                  return acc
                },
                {},
              )

              setPriorities(newPriorities)

              // Set the last account as remainder
              const lastAccountId = accountsInPriorityOrder[newOrder[newOrder.length - 1] as number]
              if (lastAccountId) {
                setAmountValues(prev => {
                  const newValues = { ...prev } as AmountValues
                  // Clear previous remainder
                  if (remainderId && typeof remainderId === 'string') {
                    newValues[remainderId] = 0
                  }
                  // Set new remainder
                  newValues[lastAccountId] = null
                  return newValues
                })
              }
            }}
          />
        </div>

        <div>
          <h3>Split Amounts:</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px' }}>
            {JSON.stringify(amountValues, null, 2)}
          </pre>
        </div>
      </div>
    </GustoMockProvider>
  )
}

/**
 * Simple Example with Keyboard Navigation Emphasized
 */
export const KeyboardNavigation: Story = () => {
  const Components = useComponentContext()

  const [items] = useState([
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
  ])

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
          <Components.ReorderableList
            items={[
              { label: 'Item 1', content: items[0]! },
              { label: 'Item 2', content: items[1]! },
              { label: 'Item 3', content: items[2]! },
              { label: 'Item 4', content: items[3]! },
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
