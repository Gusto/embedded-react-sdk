import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelectComboBox } from './MultiSelectComboBox'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

const mockOptions = [
  { label: 'Alice Johnson', value: '1', description: 'Engineering' },
  { label: 'Bob Williams', value: '2', description: 'Marketing' },
  { label: 'Carol Davis', value: '3', description: 'Sales' },
]

const renderComponent = (props = {}) => {
  const defaultProps = {
    label: 'Select employees',
    options: mockOptions,
    selectedValues: [] as string[],
    onSelectionChange: vi.fn(),
    ...props,
  }

  return {
    ...render(
      <GustoTestProvider>
        <MultiSelectComboBox {...defaultProps} />
      </GustoTestProvider>,
    ),
    onSelectionChange: defaultProps.onSelectionChange,
  }
}

describe('MultiSelectComboBox', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      renderComponent()
      expect(screen.getByText('Select employees')).toBeInTheDocument()
    })

    it('renders with placeholder when no items selected', () => {
      renderComponent({ placeholder: 'Search by name' })
      expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument()
    })

    it('renders selected items as chips', () => {
      renderComponent({ selectedValues: ['1', '2'] })
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('Bob Williams')).toBeInTheDocument()
    })

    it('renders error message when invalid', () => {
      renderComponent({ isInvalid: true, errorMessage: 'Required field' })
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })

    it('renders description text', () => {
      renderComponent({ description: 'Choose one or more' })
      expect(screen.getByText('Choose one or more')).toBeInTheDocument()
    })

    it('renders loading description when loading', () => {
      renderComponent({ isLoading: true })
      expect(screen.getByText('Loading options...')).toBeInTheDocument()
    })
  })

  describe('chip removal', () => {
    it('calls onSelectionChange without removed item when chip X is clicked', async () => {
      const user = userEvent.setup()
      const { onSelectionChange } = renderComponent({ selectedValues: ['1', '2'] })

      const removeButton = screen.getByLabelText('Remove Alice Johnson')
      await user.click(removeButton)

      expect(onSelectionChange).toHaveBeenCalledWith(['2'])
    })
  })

  describe('combobox input', () => {
    it('renders the combobox input', () => {
      renderComponent()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('selection', () => {
    it('filters out already-selected options from the dropdown', () => {
      renderComponent({ selectedValues: ['1'] })
      const combobox = screen.getByRole('combobox')
      expect(combobox).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /Alice Johnson/ })).not.toBeInTheDocument()
    })

    it('shows option descriptions in dropdown labels', async () => {
      const user = userEvent.setup()
      renderComponent()
      const combobox = screen.getByRole('combobox')
      await user.click(combobox)
      expect(screen.getByText('Alice Johnson — Engineering')).toBeInTheDocument()
    })

    it('calls onSelectionChange with the new value when an option is selected', async () => {
      const user = userEvent.setup()
      const { onSelectionChange } = renderComponent()
      const combobox = screen.getByRole('combobox')
      await user.click(combobox)

      const option = screen.getByRole('option', { name: /Alice Johnson/ })
      await user.click(option)

      expect(onSelectionChange).toHaveBeenCalledWith(['1'])
    })

    it('clears the input after an option is selected', async () => {
      const user = userEvent.setup()
      renderComponent()
      const combobox = screen.getByRole('combobox')
      await user.type(combobox, 'Ali')
      await user.click(screen.getByRole('option', { name: /Alice Johnson/ }))

      expect(combobox).toHaveValue('')
    })
  })

  describe('disabled state', () => {
    it('disables input when isDisabled is true', () => {
      renderComponent({ isDisabled: true })
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('disables chip remove buttons when isDisabled is true', () => {
      renderComponent({ isDisabled: true, selectedValues: ['1'] })
      expect(screen.getByLabelText('Remove Alice Johnson')).toBeDisabled()
    })
  })
})
