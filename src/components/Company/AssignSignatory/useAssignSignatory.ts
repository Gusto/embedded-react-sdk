import { type CreateSignatoryDefaultValues } from './CreateSignatory'
import { type InviteSignatoryDefaultValues } from './InviteSignatory'
import type { BaseComponentInterface } from '@/components/Base'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

/** @internal */
export const SignatoryAssignmentMode = {
  createSignatory: 'createSignatory',
  inviteSignatory: 'inviteSignatory',
} as const

/**
 * Default values for the create and invite forms rendered by {@link AssignSignatory}.
 *
 * @remarks
 * At least one of `create` or `invite` must be provided.
 *
 * @public
 */
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
