import React, { useState } from 'react'
import { ComponentsProvider } from '../../src/contexts/ComponentAdapter/ComponentsProvider'
import { MUIComponentAdapter } from '../adapters/MUIComponentAdapter'

export const MUIAdapterDemo = () => {
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [checkboxGroupValue, setCheckboxGroupValue] = useState(['option1'])
  const [comboBoxValue, setComboBoxValue] = useState('')
  const [dateValue, setDateValue] = useState<Date | null>(null)
  const [radioValue, setRadioValue] = useState(false)
  const [radioGroupValue, setRadioGroupValue] = useState('female')
  const [selectValue, setSelectValue] = useState('')
  const [switchValue, setSwitchValue] = useState(true)
  const [textValue, setTextValue] = useState('')
  const [numberValue, setNumberValue] = useState<number | undefined>(undefined)

  return (
    <ComponentsProvider value={MUIComponentAdapter}>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', color: '#1976d2' }}>
          Material-UI Component Adapter Demo
        </h1>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Text Input</h3>
          <MUIComponentAdapter.TextInput
            label="Name"
            name="name"
            value={textValue}
            placeholder="Enter your name"
            onChange={value => setTextValue(value)}
          />
          {textValue && <div style={{ marginTop: '10px' }}>Current value: {textValue}</div>}
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Number Input</h3>
          <MUIComponentAdapter.NumberInput
            label="Age"
            name="age"
            value={numberValue}
            placeholder="Enter your age"
            min={0}
            max={120}
            onChange={value => setNumberValue(value)}
          />
          {numberValue !== undefined && (
            <div style={{ marginTop: '10px' }}>Current value: {numberValue}</div>
          )}
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Checkbox</h3>
          <MUIComponentAdapter.Checkbox
            label="I agree to terms and conditions"
            name="agree"
            value={checkboxValue}
            onChange={value => setCheckboxValue(value)}
          />
          <div style={{ marginTop: '10px' }}>Status: {checkboxValue ? 'Agreed' : 'Not agreed'}</div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Checkbox Group</h3>
          <MUIComponentAdapter.CheckboxGroup
            label="Select Options"
            options={[
              { label: 'Option 1', value: 'option1' },
              { label: 'Option 2', value: 'option2' },
              { label: 'Option 3', value: 'option3', description: 'With description' },
            ]}
            value={checkboxGroupValue}
            onChange={value => setCheckboxGroupValue(value)}
          />
          <div style={{ marginTop: '10px' }}>
            Selected: {checkboxGroupValue.join(', ') || 'None'}
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>ComboBox</h3>
          <MUIComponentAdapter.ComboBox
            label="Country"
            name="country"
            value={comboBoxValue}
            options={[
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'Mexico', value: 'mx' },
              { label: 'United Kingdom', value: 'uk' },
              { label: 'France', value: 'fr' },
              { label: 'Germany', value: 'de' },
            ]}
            placeholder="Select a country"
            onChange={value => setComboBoxValue(value)}
          />
          {comboBoxValue && (
            <div style={{ marginTop: '10px' }}>Selected country: {comboBoxValue}</div>
          )}
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Date Picker</h3>
          <MUIComponentAdapter.DatePicker
            label="Birth Date"
            name="birthdate"
            value={dateValue}
            onChange={date => setDateValue(date)}
          />
          {dateValue && (
            <div style={{ marginTop: '10px' }}>Selected date: {dateValue.toLocaleDateString()}</div>
          )}
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Radio</h3>
          <MUIComponentAdapter.Radio
            label="Select this option"
            name="option"
            value={radioValue}
            onChange={value => setRadioValue(value)}
          />
          <div style={{ marginTop: '10px' }}>
            Status: {radioValue ? 'Selected' : 'Not selected'}
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Radio Group</h3>
          <MUIComponentAdapter.RadioGroup
            label="Gender"
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
            value={radioGroupValue}
            onChange={value => setRadioGroupValue(value)}
          />
          <div style={{ marginTop: '10px' }}>Selected gender: {radioGroupValue}</div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Select</h3>
          <MUIComponentAdapter.Select
            label="Country"
            name="country"
            value={selectValue}
            options={[
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'Mexico', value: 'mx' },
              { label: 'United Kingdom', value: 'uk' },
              { label: 'France', value: 'fr' },
              { label: 'Germany', value: 'de' },
            ]}
            placeholder="Select a country"
            onChange={value => setSelectValue(value)}
          />
          {selectValue && <div style={{ marginTop: '10px' }}>Selected country: {selectValue}</div>}
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <h3>Switch</h3>
          <MUIComponentAdapter.Switch
            label="Enable notifications"
            name="notifications"
            value={switchValue}
            onChange={value => setSwitchValue(value)}
          />
          <div style={{ marginTop: '10px' }}>
            Notifications: {switchValue ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>
    </ComponentsProvider>
  )
}
