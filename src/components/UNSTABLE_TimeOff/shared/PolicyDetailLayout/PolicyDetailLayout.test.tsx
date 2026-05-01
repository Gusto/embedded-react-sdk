import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import type { EmployeeTableItem } from '../EmployeeTable/EmployeeTableTypes'
import { PolicyDetailLayout } from './PolicyDetailLayout'
import type { PolicyDetailLayoutProps } from './PolicyDetailLayoutTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { mockUseContainerBreakpoints } from '@/test/setup'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

interface TestEmployee extends EmployeeTableItem {
  uuid: string
}

const testEmployees: TestEmployee[] = [
  { uuid: '1', firstName: 'Alice', lastName: 'Smith', jobTitle: 'Engineer' },
  { uuid: '2', firstName: 'Bob', lastName: 'Jones', jobTitle: 'Designer' },
]

function buildProps(
  overrides: Partial<PolicyDetailLayoutProps<TestEmployee>> = {},
): PolicyDetailLayoutProps<TestEmployee> {
  return {
    title: 'Test Policy',
    onBack: vi.fn(),
    backLabel: 'Back',
    firstTab: { id: 'details', label: 'Details', content: <div>Details content</div> },
    selectedTabId: 'details',
    onTabChange: vi.fn(),
    employees: {
      data: testEmployees,
      searchValue: '',
      onSearchChange: vi.fn(),
      onSearchClear: vi.fn(),
    },
    removeDialog: {
      isOpen: false,
      employeeName: '',
      onConfirm: vi.fn(),
      onClose: vi.fn(),
      isPending: false,
    },
    ...overrides,
  }
}

function renderLayout(overrides: Partial<PolicyDetailLayoutProps<TestEmployee>> = {}) {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <PolicyDetailLayout<TestEmployee> {...buildProps(overrides)} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('PolicyDetailLayout bulkRemoveDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
  })

  test('does not render bulk remove dialog when bulkRemoveDialog is undefined', () => {
    renderLayout()

    expect(screen.queryByText('bulkRemoveDialog.title')).not.toBeInTheDocument()
  })

  test('does not render bulk remove dialog when isOpen is false', () => {
    renderLayout({
      bulkRemoveDialog: {
        isOpen: false,
        count: 3,
        onConfirm: vi.fn(),
        onClose: vi.fn(),
        isPending: false,
      },
    })

    const dialogs = document.querySelectorAll('dialog')
    const bulkDialog = Array.from(dialogs).find(d =>
      d.textContent.includes('bulkRemoveDialog.title'),
    )
    expect(bulkDialog).toBeDefined()
    expect(bulkDialog!.hasAttribute('open')).toBe(false)
  })

  test('renders bulk remove dialog with correct title and buttons when isOpen is true', () => {
    renderLayout({
      bulkRemoveDialog: {
        isOpen: true,
        count: 2,
        onConfirm: vi.fn(),
        onClose: vi.fn(),
        isPending: false,
      },
    })

    expect(screen.getByText('bulkRemoveDialog.title')).toBeInTheDocument()
    expect(screen.getByText('bulkRemoveDialog.description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'bulkRemoveDialog.confirmCta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'bulkRemoveDialog.cancelCta' })).toBeInTheDocument()
  })

  test('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    renderLayout({
      bulkRemoveDialog: {
        isOpen: true,
        count: 2,
        onConfirm,
        onClose: vi.fn(),
        isPending: false,
      },
    })

    await userEvent.click(screen.getByRole('button', { name: 'bulkRemoveDialog.confirmCta' }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
