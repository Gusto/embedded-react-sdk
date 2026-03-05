import { useStoryState } from '../../../../../.storybook/helpers/useStoryState'
import { MultiSelectComboBox } from './MultiSelectComboBox'

export default {
  title: 'UI/Form/Inputs/MultiSelectComboBox',
}

const employees = [
  { label: 'Lana Steiner', value: '1' },
  { label: 'Jane Smith', value: '2' },
  { label: 'John Doe', value: '3' },
  { label: 'Alice Johnson', value: '4' },
  { label: 'Bob Williams', value: '5' },
  { label: 'Carol Davis', value: '6' },
  { label: 'David Brown', value: '7' },
  { label: 'Emily Wilson', value: '8' },
  { label: 'Frank Miller', value: '9' },
  { label: 'Grace Lee', value: '10' },
]

export const Default = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      value={value ?? []}
      onChange={handleChange}
      placeholder="Search by name or department"
    />
  )
}

export const WithPreselected = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange', [
    '1',
    '3',
  ])
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      value={value ?? []}
      onChange={handleChange}
      placeholder="Search by name or department"
    />
  )
}

export const WithDescription = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      value={value ?? []}
      onChange={handleChange}
      placeholder="Search by name or department"
      description="Choose one or more employees for this payroll"
    />
  )
}

export const WithError = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      value={value ?? []}
      onChange={handleChange}
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
      value={['1', '2']}
      onChange={() => {}}
      isDisabled
    />
  )
}

export const Loading = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={[]}
      value={value ?? []}
      onChange={handleChange}
      isLoading
      placeholder="Loading employees..."
    />
  )
}

const largeList = Array.from({ length: 500 }, (_, i) => ({
  label: `Employee ${i + 1}`,
  value: String(i + 1),
}))

export const WithLargeList = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={largeList}
      value={value ?? []}
      onChange={handleChange}
      placeholder="Search employees..."
    />
  )
}

export const Required = () => {
  const { value, handleChange } = useStoryState<string[]>('MultiSelectComboBox onChange')
  return (
    <MultiSelectComboBox
      label="Select employees"
      options={employees}
      value={value ?? []}
      onChange={handleChange}
      isRequired
      placeholder="Search by name or department"
    />
  )
}
