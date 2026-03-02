import { useStoryState } from '../../../../.storybook/helpers/useStoryState'
import { MultiSelectComboBox } from './MultiSelectComboBox'

export default {
  title: 'UI/Form/Inputs/MultiSelectComboBox',
}

const employees = [
  { label: 'Lana Steiner', value: '1', description: 'Engineering' },
  { label: 'Jane Smith', value: '2', description: 'Marketing' },
  { label: 'John Doe', value: '3', description: 'Sales' },
  { label: 'Alice Johnson', value: '4', description: 'Engineering' },
  { label: 'Bob Williams', value: '5', description: 'Product' },
  { label: 'Carol Davis', value: '6', description: 'Design' },
  { label: 'David Brown', value: '7', description: 'Engineering' },
  { label: 'Emily Wilson', value: '8', description: 'Marketing' },
  { label: 'Frank Miller', value: '9', description: 'Sales' },
  { label: 'Grace Lee', value: '10', description: 'Product' },
]

export const Default = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      selectedValues={value ?? []}
      onSelectionChange={handleChange}
      placeholder="Search by name or department"
    />
  )
}

export const WithPreselected = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange', [
    '1',
    '3',
  ])
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      selectedValues={value ?? ['1', '3']}
      onSelectionChange={handleChange}
      placeholder="Search by name or department"
    />
  )
}

export const WithDescription = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      selectedValues={value ?? []}
      onSelectionChange={handleChange}
      placeholder="Search by name or department"
      description="Choose one or more employees for this payroll"
    />
  )
}

export const WithError = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      selectedValues={value ?? []}
      onSelectionChange={handleChange}
      isInvalid
      errorMessage="At least one employee must be selected"
    />
  )
}

export const Disabled = () => {
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      selectedValues={['1', '2']}
      onSelectionChange={() => {}}
      isDisabled
    />
  )
}

export const Loading = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={[]}
      selectedValues={value ?? []}
      onSelectionChange={handleChange}
      isLoading
      placeholder="Loading employees..."
    />
  )
}

const largeList = Array.from({ length: 500 }, (_, i) => ({
  label: `Employee ${i + 1}`,
  value: String(i + 1),
  description: `Department ${(i % 10) + 1}`,
}))

export const WithLargeList = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={largeList}
      selectedValues={value ?? []}
      onSelectionChange={handleChange}
      placeholder="Search employees..."
    />
  )
}

export const Required = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onSelectionChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      selectedValues={value ?? []}
      onSelectionChange={handleChange}
      isRequired
      placeholder="Search by name or department"
    />
  )
}
