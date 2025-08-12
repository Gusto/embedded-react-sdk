import { Profile } from '../Profile/Profile'
import { Compensation } from '../Compensation/Compensation'
import { Deductions } from '../Deductions'
import { PaymentMethod } from '../PaymentMethod/PaymentMethod'
import { OnboardingSummary } from '../OnboardingSummary/OnboardingSummary'
import { FederalTaxes } from '../FederalTaxes/FederalTaxes'
import { StateTaxes } from '../StateTaxes/StateTaxes'
import { EmployeeList } from '../EmployeeList/EmployeeList'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface OnboardingFlowContextInterface extends FlowContextInterface {
  employeeId?: string
  onboardingStatus?: string
  startDate?: string
  isAdmin?: boolean
  companyId?: string
}

export function ProfileContextual() {
  const { employeeId, companyId, onEvent, isAdmin } = useFlow<OnboardingFlowContextInterface>()
  return (
    <Profile
      onEvent={onEvent}
      employeeId={employeeId}
      companyId={ensureRequired(companyId)}
      isAdmin={isAdmin}
    />
  )
}

export function CompensationContextual() {
  const { employeeId, startDate, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return (
    <Compensation
      onEvent={onEvent}
      employeeId={ensureRequired(employeeId)}
      startDate={ensureRequired(startDate)}
    />
  )
}

export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <FederalTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function StateTaxesContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingFlowContextInterface>()
  return (
    <StateTaxes
      onEvent={onEvent}
      employeeId={ensureRequired(employeeId)}
      isAdmin={isAdmin ?? false}
    />
  )
}

export function PaymentMethodContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <PaymentMethod onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function DeductionsContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <Deductions onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function OnboardingSummaryContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <OnboardingSummary onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function EmployeeListContextual() {
  const { onEvent, companyId } = useFlow<OnboardingFlowContextInterface>()
  return <EmployeeList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
