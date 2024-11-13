import { CommonComponentInterface } from '@/components/Base'
import { createCompoundContext } from '@/components/Base/createCompoundContext'
import { Schemas } from '@/types'

export interface CompensationProps extends CommonComponentInterface {
  employeeId: string
  defaultValues?: Pick<Schemas['Job'], 'rate' | 'title' | 'payment_unit'>
}
export type MODE = 'LIST' | 'EDIT' | 'ADD' | 'SINGLE' | 'PROCEED'

export type CompensationContextType = {
  employeeJobs: Schemas['Job'][]
  currentJob?: Schemas['Job'] | null
  primaryFlsaStatus?: string
  isPending: boolean
  mode: MODE
  showFlsaChangeWarning: boolean
  handleCancel: () => void
  submitWithEffect: (newMode: MODE) => void
  handleEdit: (uuid: string) => void
  handleDelete: (uuid: string) => void
  handleFlsaChange: (status: string) => void
  handleCancelAddJob: () => void
}

const [useCompensation, CompensationProvider] =
  createCompoundContext<CompensationContextType>('CompensationContext')
export { useCompensation, CompensationProvider }
