import { Schemas } from '@/types'
import { createCompoundContext } from '../Base/createCompoundContext'

//Interface for context passed down to component slots
export type EmployeeListContextType = {
  handleEdit: (uuid: string) => void
  handleNew: () => void
  deleteEmployee: (uuid: string) => void
  employees: Schemas['Employee'][]
}

export const [useEmployeeList, EmployeeListProvider] =
  createCompoundContext<EmployeeListContextType>('EmployeeListContext')
