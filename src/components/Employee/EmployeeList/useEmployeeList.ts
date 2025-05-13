import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { createCompoundContext } from '@/components/Base'

//Interface for context passed down to component slots
type EmployeeListContextType = {
  handleEdit: (uuid: string, onboardingStatus?: string) => void
  handleDelete: (uuid: string) => Promise<void>
  handleCancelSelfOnboarding: (employeeId: string) => Promise<void>
  handleReview: (employeeId: string) => Promise<void>
  handleNew: () => void
  handleSkip: () => void
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (newCount: number) => void
  currentPage: number
  totalPages: number
  employees: Employee[]
}

const [useEmployeeList, EmployeeListProvider] =
  createCompoundContext<EmployeeListContextType>('EmployeeListContext')
export { useEmployeeList, EmployeeListProvider }
