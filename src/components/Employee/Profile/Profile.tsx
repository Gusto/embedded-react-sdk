import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { AdminProfile } from './AdminProfile'
import { EmployeeProfile } from './EmployeeProfile'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export type ProfileDefaultValues = RequireAtLeastOne<{
  employee?: RequireAtLeastOne<{
    firstName?: string
    middleInitial?: string
    lastName?: string
    email?: string
    dateOfBirth?: string
  }>
  homeAddress?: RequireAtLeastOne<{
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }>
  inviteEmployeeDefault?: boolean
}>

export interface ProfileProps extends CommonComponentInterface<'Employee.Profile'> {
  employeeId?: string
  companyId: string
  defaultValues?: ProfileDefaultValues
  isAdmin?: boolean
  isSelfOnboardingEnabled?: boolean
  onEvent: BaseComponentInterface['onEvent']
}

export function Profile({
  FallbackComponent,
  isAdmin = false,
  ...props
}: ProfileProps & BaseComponentInterface) {
  return (
    <BaseBoundaries componentName="Employee.Profile" FallbackComponent={FallbackComponent}>
      {isAdmin ? <AdminProfile {...props} isAdmin /> : <EmployeeProfile {...props} />}
    </BaseBoundaries>
  )
}

export const ProfileContextual = () => {
  const { companyId, employeeId, onEvent, isAdmin, defaultValues, isSelfOnboardingEnabled } =
    useFlow<OnboardingContextInterface>()

  return (
    <Profile
      companyId={ensureRequired(companyId)}
      employeeId={employeeId}
      onEvent={onEvent}
      isAdmin={isAdmin}
      defaultValues={defaultValues?.profile}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
    />
  )
}
