import React from 'react'
import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { DatePickerField } from './DatePickerField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/DatePickerField', // Updated to be under UI/Form instead of top-level Form
}

export const Default: Story = () => {
  return (
    <FormWrapper>
      <DatePickerField name="birthDate" label="Birth Date" />
      <DatePickerField name="appointmentDate" label="Appointment Date" />
      <DatePickerField name="startDate" label="Start Date" />
    </FormWrapper>
  )
}

export const Required: Story = () => {
  return (
    <FormWrapper>
      <DatePickerField
        name="birthDate"
        label="Birth Date"
        isRequired
        errorMessage="Birth date is required"
      />
      <DatePickerField
        name="appointmentDate"
        label="Appointment Date"
        isRequired
        errorMessage="Appointment date is required"
      />
      <DatePickerField
        name="startDate"
        label="Start Date"
        isRequired
        errorMessage="Start date is required"
      />
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  // Use JavaScript's native Date objects for default values
  const birthDate = new Date(1990, 0, 1) // January 1, 1990
  const appointmentDate = new Date(2023, 11, 25) // December 25, 2023
  const startDate = new Date(2024, 0, 1) // January 1, 2024

  return (
    <FormWrapper
      defaultValues={{
        birthDate,
        appointmentDate,
        startDate,
      }}
    >
      <DatePickerField name="birthDate" label="Birth Date" />
      <DatePickerField name="appointmentDate" label="Appointment Date" />
      <DatePickerField name="startDate" label="Start Date" />
    </FormWrapper>
  )
}

export const WithDescription: Story = () => {
  return (
    <FormWrapper>
      <DatePickerField name="birthDate" label="Birth Date" description="Enter your date of birth" />
      <DatePickerField
        name="appointmentDate"
        label="Appointment Date"
        description="Choose your preferred appointment date"
      />
      <DatePickerField
        name="startDate"
        label="Start Date"
        description="Select when you would like to start"
      />
    </FormWrapper>
  )
}

export const BugDemonstration: Story = () => {
  const [selectedDate, setSelectedDate] = React.useState<string>('2023-12-25')
  const [timezone] = React.useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Simulate the problematic pattern that Shopify reported
  const problematicDate = new Date(selectedDate) // This is the bug!
  const correctedDate = React.useMemo(() => {
    if (!selectedDate) return null
    const parts = selectedDate.split('-')
    if (parts.length !== 3) return null
    const year = parseInt(parts[0]!)
    const month = parseInt(parts[1]!) - 1 // Month is 0-indexed
    const day = parseInt(parts[2]!)
    return new Date(year, month, day) // Correct way
  }, [selectedDate])

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '24px' }}>
        🐛 DatePicker Timezone Bug Demonstration
      </h2>

      <div
        style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Your timezone: {timezone}</p>
        <p style={{ margin: '0', fontSize: '14px' }}>
          The bug is most visible in negative UTC offset timezones (Americas, Pacific).
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="test-date-input"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Select a test date:
        </label>
        <input
          id="test-date-input"
          type="date"
          value={selectedDate}
          onChange={e => {
            setSelectedDate(e.target.value)
          }}
          style={{
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
        {/* Problematic behavior */}
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#dc2626' }}>
            ❌ Problematic Pattern (Before Fix)
          </h3>
          <pre
            style={{
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              margin: '8px 0',
            }}
          >
            {`const date = new Date("${selectedDate}")
// Result: ${problematicDate.toString()}`}
          </pre>
          <div style={{ fontSize: '14px' }}>
            <strong>Displays as:</strong>
            <br />
            Date: {problematicDate.getDate()}
            <br />
            Month: {problematicDate.getMonth() + 1}
            <br />
            Year: {problematicDate.getFullYear()}
            <br />
            Time: {problematicDate.getHours()}:
            {problematicDate.getMinutes().toString().padStart(2, '0')}
          </div>
        </div>

        {/* Correct behavior */}
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #d1fae5',
            padding: '16px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#059669' }}>✅ Fixed Pattern (After Fix)</h3>
          <pre
            style={{
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              margin: '8px 0',
            }}
          >
            {`const date = new Date(year, month-1, day)
// Result: ${correctedDate?.toString()}`}
          </pre>
          <div style={{ fontSize: '14px' }}>
            <strong>Displays as:</strong>
            <br />
            Date: {correctedDate?.getDate()}
            <br />
            Month: {(correctedDate?.getMonth() ?? 0) + 1}
            <br />
            Year: {correctedDate?.getFullYear()}
            <br />
            Time: {correctedDate?.getHours()}:
            {correctedDate?.getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0' }}>🎯 DatePickerField Automatic Fix</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
            DatePickerField now automatically detects and corrects timezone-shifted dates from
            problematic adapters:
          </p>
          <FormWrapper>
            <DatePickerField
              name="testDate"
              label="Test DatePickerField"
              description="This will automatically correct any timezone-shifted dates from component adapters"
            />
          </FormWrapper>
        </div>
      </div>

      {timezone.includes('America') || timezone.includes('Pacific') ? (
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #d1fae5',
            padding: '12px',
            borderRadius: '6px',
          }}
        >
          <p style={{ margin: '0', fontSize: '14px' }}>
            ✅ <strong>Perfect!</strong> Your timezone ({timezone}) would have been affected by this
            bug. Notice how the problematic pattern shows different dates/times while the fixed
            version shows exactly what you would expect.
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            padding: '12px',
            borderRadius: '6px',
          }}
        >
          <p style={{ margin: '0', fontSize: '14px' }}>
            ⚠️ Your timezone ({timezone}) might not show the bug clearly. The issue is most visible
            in negative UTC offset timezones (Americas, Pacific regions).
          </p>
        </div>
      )}
    </div>
  )
}
