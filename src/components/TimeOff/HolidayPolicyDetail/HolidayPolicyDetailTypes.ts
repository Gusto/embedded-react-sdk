import type { ReactNode } from 'react'
import type { HolidayItem } from '../HolidaySelectionForm/HolidaySelectionFormTypes'
import type {
  EmployeeTableItem,
  PolicyDetailEmployeeTableData,
} from '../shared/EmployeeTable/EmployeeTableTypes'
import type { RemoveDialogState } from '../shared/PolicyDetailLayout/PolicyDetailLayoutTypes'

/**
 * An employee row rendered in the holiday policy detail employees tab.
 *
 * @public
 */
export interface HolidayPolicyDetailEmployee extends EmployeeTableItem {
  /** Unique identifier for the employee. */
  uuid: string
}

/**
 * Props for the holiday policy detail presentation component, which renders the
 * holidays and employees tabs along with the remove-employee confirmation dialog
 * and an optional success alert.
 *
 * @public
 */
export interface HolidayPolicyDetailPresentationProps {
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

  /** Selected holidays shown in the holidays tab. */
  holidays: HolidayItem[]

  /** The currently active tab (`'holidays'` or `'employees'`). */
  selectedTabId: string
  /** Called with the tab id when the user switches tabs. */
  onTabChange: (id: string) => void

  /** Employee table data and handlers for the employees tab. */
  employees: PolicyDetailEmployeeTableData<HolidayPolicyDetailEmployee>

  /** Called when the user triggers the add-employee action from the empty state. */
  onAddEmployee?: () => void

  /** State for the employee removal confirmation dialog. */
  removeDialog: RemoveDialogState
  /** Success message displayed as a dismissible alert above the content. */
  successAlert?: string
  /** Called when the success alert is dismissed. */
  onDismissAlert?: () => void
}
