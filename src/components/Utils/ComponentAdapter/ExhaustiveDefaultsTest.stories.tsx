import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Grid } from '@/components/Common/Grid/Grid'
export default {
  title: 'Utils/Component Adapter/EXHAUSTIVE TEST',
}
import { createComponents } from '@/contexts/ComponentAdapter/createComponentsWithDefaults'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import type { ButtonProps, ButtonIconProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { CardProps } from '@/components/Common/UI/Card/CardTypes'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'
import type { LinkProps } from '@/components/Common/UI/Link/LinkTypes'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { OrderedListProps, UnorderedListProps } from '@/components/Common/UI/List/ListTypes'
import type { ProgressBarProps } from '@/components/Common/UI/ProgressBar/ProgressBarTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { TableProps } from '@/components/Common/UI/Table/TableTypes'
import type { CalendarPreviewProps } from '@/components/Common/UI/CalendarPreview/CalendarPreviewTypes'

// PropDisplay component that shows what props each component receives
interface PropDisplayProps<T = Record<string, unknown>> {
  componentName: string
  expectedDefaults: Partial<T>
  children?: React.ReactNode
  [key: string]: unknown
}

const PropDisplay = <T = Record<string, unknown>,>({
  componentName,
  expectedDefaults,
  children,
  ...receivedProps
}: PropDisplayProps<T>) => {
  const hasAllExpectedDefaults = Object.entries(expectedDefaults).every(
    ([key, expectedValue]) => receivedProps[key] === expectedValue,
  )

  return (
    <div
      style={{
        padding: '12px',
        border: `2px solid ${hasAllExpectedDefaults ? '#28a745' : '#dc3545'}`,
        borderRadius: '8px',
        backgroundColor: hasAllExpectedDefaults ? '#f8fff9' : '#fff8f8',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>{componentName}</h4>
        <span
          style={{
            marginLeft: '8px',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: hasAllExpectedDefaults ? '#28a745' : '#dc3545',
            color: 'white',
          }}
        >
          {hasAllExpectedDefaults ? '✅ PASS' : '❌ FAIL'}
        </span>
      </div>

      <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Expected Defaults:</strong>
          <pre style={{ margin: '2px 0', color: '#007bff' }}>
            {JSON.stringify(expectedDefaults, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Actually Received:</strong>
          <pre style={{ margin: '2px 0', color: hasAllExpectedDefaults ? '#28a745' : '#dc3545' }}>
            {JSON.stringify(receivedProps, null, 2)}
          </pre>
        </div>
      </div>

      {children && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '4px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// Test component that uses the component context and applies auto-defaults
const ExhaustiveDefaultsTestComponent = () => {
  const ContextComponents = useComponentContext()

  // Apply createComponents to the components from context
  const Components = createComponents({
    Alert: (props: AlertProps) => (
      <PropDisplay<AlertProps>
        componentName="Alert"
        expectedDefaults={{ status: 'info' }}
        {...props}
      >
        <ContextComponents.Alert {...props} />
      </PropDisplay>
    ),
    Badge: (props: BadgeProps) => (
      <PropDisplay<BadgeProps>
        componentName="Badge"
        expectedDefaults={{ status: 'info' }}
        {...props}
      >
        <ContextComponents.Badge {...props} />
      </PropDisplay>
    ),
    Button: (props: ButtonProps) => (
      <PropDisplay<ButtonProps>
        componentName="Button"
        expectedDefaults={{ variant: 'primary', isLoading: false, isDisabled: false }}
        {...props}
      >
        <ContextComponents.Button {...props} />
      </PropDisplay>
    ),
    ButtonIcon: (props: ButtonIconProps) => (
      <PropDisplay<ButtonIconProps>
        componentName="ButtonIcon"
        expectedDefaults={{ variant: 'tertiary', isLoading: false, isDisabled: false }}
        {...props}
      >
        <ContextComponents.ButtonIcon {...props}>🔧</ContextComponents.ButtonIcon>
      </PropDisplay>
    ),
    Checkbox: (props: CheckboxProps) => (
      <PropDisplay<CheckboxProps>
        componentName="Checkbox"
        expectedDefaults={{ isInvalid: false, isDisabled: false }}
        {...props}
      >
        <ContextComponents.Checkbox {...props} label="Checkbox Label" />
      </PropDisplay>
    ),
    CheckboxGroup: (props: CheckboxGroupProps) => (
      <PropDisplay<CheckboxGroupProps>
        componentName="CheckboxGroup"
        expectedDefaults={{
          isRequired: false,
          isInvalid: false,
          isDisabled: false,
          shouldVisuallyHideLabel: false,
        }}
        {...props}
      >
        <ContextComponents.CheckboxGroup {...props} label="Checkbox Group" />
      </PropDisplay>
    ),
    Menu: (props: MenuProps) => (
      <PropDisplay<MenuProps> componentName="Menu" expectedDefaults={{ isOpen: false }} {...props}>
        <ContextComponents.Menu {...props} />
      </PropDisplay>
    ),
    Radio: (props: RadioProps) => (
      <PropDisplay<RadioProps>
        componentName="Radio"
        expectedDefaults={{ isInvalid: false, isDisabled: false }}
        {...props}
      >
        <ContextComponents.Radio {...props} label="Radio Label" />
      </PropDisplay>
    ),
    RadioGroup: (props: RadioGroupProps) => (
      <PropDisplay<RadioGroupProps>
        componentName="RadioGroup"
        expectedDefaults={{
          isRequired: false,
          isInvalid: false,
          isDisabled: false,
          shouldVisuallyHideLabel: false,
        }}
        {...props}
      >
        <ContextComponents.RadioGroup {...props} label="Radio Group" />
      </PropDisplay>
    ),
    Switch: (props: SwitchProps) => (
      <PropDisplay<SwitchProps>
        componentName="Switch"
        expectedDefaults={{ isInvalid: false, isDisabled: false }}
        {...props}
      >
        <ContextComponents.Switch {...props} label="Switch Label" />
      </PropDisplay>
    ),
    Text: (props: TextProps) => (
      <PropDisplay<TextProps>
        componentName="Text"
        expectedDefaults={{ as: 'p', size: 'md' }}
        {...props}
      >
        <ContextComponents.Text {...props} />
      </PropDisplay>
    ),
    TextInput: (props: TextInputProps) => (
      <PropDisplay<TextInputProps>
        componentName="TextInput"
        expectedDefaults={{ type: 'text', isInvalid: false, isDisabled: false }}
        {...props}
      >
        <ContextComponents.TextInput {...props} placeholder="Custom TextInput" />
      </PropDisplay>
    ),
    // Components without defaults - just pass through
    Card: (props: CardProps) => (
      <PropDisplay<CardProps> componentName="Card" expectedDefaults={{}} {...props}>
        <ContextComponents.Card {...props}>Card Content</ContextComponents.Card>
      </PropDisplay>
    ),
    ComboBox: (props: ComboBoxProps) => (
      <PropDisplay<ComboBoxProps> componentName="ComboBox" expectedDefaults={{}} {...props}>
        <ContextComponents.ComboBox {...props} />
      </PropDisplay>
    ),
    DatePicker: (props: DatePickerProps) => (
      <PropDisplay<DatePickerProps> componentName="DatePicker" expectedDefaults={{}} {...props}>
        <ContextComponents.DatePicker {...props} />
      </PropDisplay>
    ),
    Heading: (props: HeadingProps) => (
      <PropDisplay<HeadingProps> componentName="Heading" expectedDefaults={{}} {...props}>
        <ContextComponents.Heading {...props} as="h3">
          Heading Test
        </ContextComponents.Heading>
      </PropDisplay>
    ),
    Link: (props: LinkProps) => (
      <PropDisplay<LinkProps> componentName="Link" expectedDefaults={{}} {...props}>
        <ContextComponents.Link {...props} href="https://example.com">
          Link Test
        </ContextComponents.Link>
      </PropDisplay>
    ),
    NumberInput: (props: NumberInputProps) => (
      <PropDisplay<NumberInputProps> componentName="NumberInput" expectedDefaults={{}} {...props}>
        <ContextComponents.NumberInput {...props} />
      </PropDisplay>
    ),
    OrderedList: (props: OrderedListProps) => (
      <PropDisplay<OrderedListProps> componentName="OrderedList" expectedDefaults={{}} {...props}>
        <ContextComponents.OrderedList {...props} items={['Item 1', 'Item 2']} />
      </PropDisplay>
    ),
    UnorderedList: (props: UnorderedListProps) => (
      <PropDisplay<UnorderedListProps>
        componentName="UnorderedList"
        expectedDefaults={{}}
        {...props}
      >
        <ContextComponents.UnorderedList {...props} items={['Item 1', 'Item 2']} />
      </PropDisplay>
    ),
    ProgressBar: (props: ProgressBarProps) => (
      <PropDisplay<ProgressBarProps> componentName="ProgressBar" expectedDefaults={{}} {...props}>
        <ContextComponents.ProgressBar
          {...props}
          totalSteps={10}
          currentStep={5}
          label="Progress"
        />
      </PropDisplay>
    ),
    Select: (props: SelectProps) => (
      <PropDisplay<SelectProps> componentName="Select" expectedDefaults={{}} {...props}>
        <ContextComponents.Select {...props} />
      </PropDisplay>
    ),
    Table: (props: TableProps) => (
      <PropDisplay<TableProps> componentName="Table" expectedDefaults={{}} {...props}>
        <ContextComponents.Table
          {...props}
          headers={[{ key: 'col1', content: 'Header' }]}
          rows={[{ key: 'row1', data: [{ key: 'col1', content: 'Data' }] }]}
        />
      </PropDisplay>
    ),
    CalendarPreview: (props: CalendarPreviewProps) => (
      <PropDisplay<CalendarPreviewProps>
        componentName="CalendarPreview"
        expectedDefaults={{}}
        {...props}
      >
        <ContextComponents.CalendarPreview
          {...props}
          dateRange={{ start: new Date(), end: new Date(), label: 'Test Range' }}
        />
      </PropDisplay>
    ),
  })

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          marginBottom: '32px',
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #2196f3',
        }}
      >
        <h1 style={{ margin: '0 0 16px 0', color: '#1565c0' }}>
          🧪 EXHAUSTIVE Component Adapter Defaults Test
        </h1>
        <p style={{ margin: '0 0 12px 0', color: '#1565c0' }}>
          <strong>Purpose:</strong> Test that EVERY component with defaults in the registry
          automatically receives those defaults through the component adapter system.
        </p>
        <p style={{ margin: '0', color: '#1565c0' }}>
          <strong>✅ Green borders = All expected defaults received correctly</strong>
          <br />
          <strong>❌ Red borders = Missing or incorrect defaults</strong>
        </p>
      </div>

      <Grid gridTemplateColumns="1fr" gap={24}>
        {/* SECTION 1: Components WITH defaults in registry */}
        <section>
          <h2
            style={{
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '8px',
              margin: '0 0 16px 0',
            }}
          >
            📋 Components WITH Defaults (Should all be GREEN ✅)
          </h2>

          <Grid gridTemplateColumns={['1fr', '1fr']} gap={16}>
            <div>
              <h3>Form Components</h3>
              <Components.TextInput label="Text Input Test" />
              <Components.Checkbox label="Checkbox Test" />
              <Components.Switch label="Switch Test" />
              <Components.Radio label="Radio Test" />
              <Components.CheckboxGroup
                label="Checkbox Group Test"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                ]}
              />
              <Components.RadioGroup
                label="Radio Group Test"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                ]}
              />
            </div>

            <div>
              <h3>Display Components</h3>
              <Components.Button>Button Test</Components.Button>
              <Components.ButtonIcon aria-label="Icon button test">🔧</Components.ButtonIcon>
              <Components.Text>Text Test</Components.Text>
              <Components.Badge>Badge Test</Components.Badge>
              <Components.Alert label="Alert Test">Alert content</Components.Alert>
              <Components.Menu
                aria-label="Menu test"
                items={[
                  { label: 'Item 1', onClick: () => {} },
                  { label: 'Item 2', onClick: () => {} },
                ]}
              />
            </div>
          </Grid>
        </section>

        {/* SECTION 2: Summary */}
        <section
          style={{
            padding: '24px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', color: '#856404' }}>🎯 Manual Testing Checklist</h2>

          <div style={{ color: '#856404' }}>
            <h3>✅ Components WITH Defaults - Should ALL be GREEN:</h3>
            <ul>
              <li>
                <strong>Alert:</strong> Should show status=&apos;info&apos;
              </li>
              <li>
                <strong>Badge:</strong> Should show status=&apos;info&apos;
              </li>
              <li>
                <strong>Button:</strong> Should show variant=&apos;primary&apos;, isLoading=false,
                isDisabled=false
              </li>
              <li>
                <strong>ButtonIcon:</strong> Should show variant=&apos;tertiary&apos;,
                isLoading=false, isDisabled=false
              </li>
              <li>
                <strong>Checkbox:</strong> Should show isInvalid=false, isDisabled=false
              </li>
              <li>
                <strong>CheckboxGroup:</strong> Should show isRequired=false, isInvalid=false,
                isDisabled=false, shouldVisuallyHideLabel=false
              </li>
              <li>
                <strong>Menu:</strong> Should show isOpen=false
              </li>
              <li>
                <strong>Radio:</strong> Should show isInvalid=false, isDisabled=false
              </li>
              <li>
                <strong>RadioGroup:</strong> Should show isRequired=false, isInvalid=false,
                isDisabled=false, shouldVisuallyHideLabel=false
              </li>
              <li>
                <strong>Switch:</strong> Should show isInvalid=false, isDisabled=false
              </li>
              <li>
                <strong>Text:</strong> Should show as=&apos;p&apos;, size=&apos;md&apos;
              </li>
              <li>
                <strong>TextInput:</strong> Should show type=&apos;text&apos;, isInvalid=false,
                isDisabled=false
              </li>
            </ul>

            <h3>⚪ Components WITHOUT Defaults - Should show only passed props:</h3>
            <ul>
              <li>
                <strong>
                  Card, ComboBox, DatePicker, Heading, Link, NumberInput, OrderedList,
                  UnorderedList, ProgressBar, Select, Table, CalendarPreview:
                </strong>{' '}
                Should only show the props we explicitly passed
              </li>
            </ul>

            <h3>🚨 Things to Verify:</h3>
            <ul>
              <li>No console errors should appear</li>
              <li>All green-bordered components should show expected defaults</li>
              <li>Components should render without visual glitches</li>
              <li>Props should exactly match expected values</li>
            </ul>
          </div>
        </section>
      </Grid>
    </div>
  )
}

export const ExhaustiveDefaultsTest: Story = () => <ExhaustiveDefaultsTestComponent />
