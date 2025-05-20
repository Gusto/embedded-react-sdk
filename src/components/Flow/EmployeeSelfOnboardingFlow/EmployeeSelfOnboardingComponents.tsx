import { useFlow } from '../useFlow'
import type { EmployeeSelfOnboardingContextInterface } from './EmployeeSelfOnboardingFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import * as Employee from '@/components/Employee'

export function Landing() {
  const { companyId, employeeId, onEvent } = useFlow<EmployeeSelfOnboardingContextInterface>()
  return (
    <Employee.Landing
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
    />
  )
}

export function Profile() {
  const { companyId, employeeId, onEvent } = useFlow<EmployeeSelfOnboardingContextInterface>()
  return (
    <Employee.Profile
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}

export function Taxes() {
  const { employeeId, onEvent } = useFlow<EmployeeSelfOnboardingContextInterface>()
  return <Employee.Taxes employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function PaymentMethod() {
  const { employeeId, onEvent } = useFlow<EmployeeSelfOnboardingContextInterface>()
  return <Employee.PaymentMethod employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function OnboardingSummary() {
  const { employeeId, onEvent } = useFlow<EmployeeSelfOnboardingContextInterface>()
  return (
    <Employee.OnboardingSummary
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}
