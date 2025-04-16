import { type CreateSignatoryDefaultValues } from './CreateSignatory'
import { type InviteSignatoryDefaultValues } from './InviteSignatory'
import type { BaseComponentInterface } from '@/components/Base'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

export const SignatoryAssignmentMode = {
  createSignatory: 'createSignatory',
  inviteSignatory: 'inviteSignatory',
} as const

export type AssignSignatoryDefaultValues = RequireAtLeastOne<{
  create?: CreateSignatoryDefaultValues
  invite?: InviteSignatoryDefaultValues
}>

type AssignSignatoryContextType = {
  companyId: string
  signatoryId?: string
  defaultValues?: AssignSignatoryDefaultValues
  onSignatoryAssignmentModeChange: (mode: string) => void
  onSignatoryFormEvent: BaseComponentInterface['onEvent']
}

const [useAssignSignatory, AssignSignatoryProvider] =
  createCompoundContext<AssignSignatoryContextType>('AssignSignatoryContext')

export { useAssignSignatory, AssignSignatoryProvider }
