import type { ReactNode } from 'react'
import type { EmployeeTableItem, EmployeeTableProps } from '../EmployeeTable/EmployeeTableTypes'

/**
 * State for the confirmation dialog shown when removing an employee from a time
 * off or holiday policy.
 *
 * @public
 */
export interface RemoveDialogState {
  /** Whether the dialog is currently visible. */
  isOpen: boolean
  /** Name of the employee being removed; interpolated into the dialog copy. */
  employeeName: string
  /** Called when the user confirms the removal. */
  onConfirm: () => void
  /** Called when the user cancels or dismisses the dialog without confirming. */
  onClose: () => void
  /** Whether the removal request is in flight; disables the confirm action while true. */
  isPending: boolean
}

/** @internal */
export interface PolicyDetailLayoutProps<T extends EmployeeTableItem> {
  /** The policy name displayed as the page heading. */
  title: string
  /** Secondary label shown beneath the title. */
  subtitle?: string
  /** Called when the user clicks the back navigation. */
  onBack: () => void
  /** Label for the back navigation link. */
  backLabel: string
  /** Action buttons displayed in the header (e.g. add employees, edit policy). */
  actions?: ReactNode[]

  /** First tab shown alongside the standard employees tab; supplies its id, label, and content. */
  firstTab: {
    /** Unique id used to match against `selectedTabId`. */
    id: string
    /** Tab label rendered in the tab bar. */
    label: string
    /** Tab panel content. */
    content: ReactNode
  }
  /** The currently active tab id. */
  selectedTabId: string
  /** Called with the tab id when the user switches tabs. */
  onTabChange: (id: string) => void

  /** Employee table data and handlers for the employees tab. */
  employees: Pick<
    EmployeeTableProps<T>,
    | 'data'
    | 'searchValue'
    | 'onSearchChange'
    | 'onSearchClear'
    | 'searchPlaceholder'
    | 'itemMenu'
    | 'pagination'
    | 'isFetching'
    | 'emptyState'
    | 'additionalColumns'
    | 'hideJobTitle'
  >

  /** Called when the user triggers the add-employee action from the empty state. */
  onAddEmployee?: () => void

  /** State for the employee removal confirmation dialog. */
  removeDialog: RemoveDialogState
  /** Success message displayed as a dismissible alert above the content. */
  successAlert?: string
  /** Called when the success alert is dismissed. */
  onDismissAlert?: () => void
}
