import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { AdminProfile } from './AdminProfile'
import { EmployeeProfile } from './EmployeeProfile'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { RequireAtLeastOne, WithRequired } from '@/types/Helpers'
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

export function Profile({ FallbackComponent, ...props }: ProfileProps & BaseComponentInterface) {
  return (
    <BaseBoundaries componentName="Employee.Profile" FallbackComponent={FallbackComponent}>
      {props.employeeId ? (
        <RootWithEmployee {...props} employeeId={props.employeeId} />
      ) : (
        <Root {...props} />
      )}
    </BaseBoundaries>
  )
}

function RootWithEmployee({ employeeId, ...props }: WithRequired<ProfileProps, 'employeeId'>) {
  useEmployeesGetSuspense({ employeeId })
  useEmployeeAddressesGetSuspense({ employeeId })
  useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  return <Root {...props} employeeId={employeeId} />
}

function Root({ isAdmin = false, ...props }: ProfileProps) {
  if (isAdmin) {
    return <AdminProfile {...props} isAdmin />
  }
  return <EmployeeProfile {...props} />
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
