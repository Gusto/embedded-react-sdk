import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { MultiSelectComboBoxField } from './MultiSelectComboBoxField'

export default {
  title: 'UI/Form/Fields/MultiSelectComboBox',
}

const employees = [
  { label: 'Lana Steiner', value: '1', textValue: 'Lana Steiner' },
  { label: 'Jane Smith', value: '2', textValue: 'Jane Smith' },
  { label: 'John Doe', value: '3', textValue: 'John Doe' },
  { label: 'Alice Johnson', value: '4', textValue: 'Alice Johnson' },
  { label: 'Bob Williams', value: '5', textValue: 'Bob Williams' },
]

export const Default = () => (
  <FormWrapper>
    <MultiSelectComboBoxField
      name="employees"
      label="Select employees"
      options={employees}
      placeholder="Search by name or department"
    />
  </FormWrapper>
)

export const Required = () => (
  <FormWrapper>
    <MultiSelectComboBoxField
      name="employees"
      label="Select employees"
      options={employees}
      placeholder="Search by name or department"
      isRequired
      errorMessage="At least one employee is required"
    />
    <button type="submit">Submit</button>
  </FormWrapper>
)

export const WithDefaultValues = () => (
  <FormWrapper defaultValues={{ employees: ['1', '3'] }}>
    <MultiSelectComboBoxField
      name="employees"
      label="Select employees"
      options={employees}
      placeholder="Search by name or department"
    />
  </FormWrapper>
)

export const WithDescription = () => (
  <FormWrapper>
    <MultiSelectComboBoxField
      name="employees"
      label="Select employees"
      options={employees}
      placeholder="Search by name or department"
      description="Choose one or more employees for this payroll"
    />
  </FormWrapper>
)

export const Disabled = () => (
  <FormWrapper defaultValues={{ employees: ['1', '2'] }}>
    <MultiSelectComboBoxField
      name="employees"
      label="Select employees"
      options={employees}
      isDisabled
    />
  </FormWrapper>
)
