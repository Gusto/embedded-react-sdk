import * as Employee from '@/components/Employee'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { EmployeeSelfOnboardingContextInterface } from './EmployeeSelfOnboardingFlow'

function useEmployeeSelfOnboardingFlowParams(
  props: UseFlowParamsProps<EmployeeSelfOnboardingContextInterface>,
) {
  return useFlowParams(props)
}

export function Landing() {
  const { companyId, employeeId, onEvent } = useEmployeeSelfOnboardingFlowParams({
    component: 'Landing',
    requiredParams: ['companyId', 'employeeId'],
  })
  return <Employee.Landing companyId={companyId} employeeId={employeeId} onEvent={onEvent} />
}

export function Profile() {
  const { companyId, employeeId, onEvent } = useEmployeeSelfOnboardingFlowParams({
    component: 'Profile',
    requiredParams: ['companyId', 'employeeId'],
  })
  return (
    <Employee.Profile
      companyId={companyId}
      employeeId={employeeId}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}

export function Taxes() {
  const { employeeId, onEvent } = useEmployeeSelfOnboardingFlowParams({
    component: 'Taxes',
    requiredParams: ['employeeId'],
  })
  return <Employee.Taxes employeeId={employeeId} onEvent={onEvent} />
}

export function PaymentMethod() {
  const { employeeId, onEvent } = useEmployeeSelfOnboardingFlowParams({
    component: 'PaymentMethod',
    requiredParams: ['employeeId'],
  })
  return <Employee.PaymentMethod employeeId={employeeId} onEvent={onEvent} />
}

export function DocumentSigner() {
  const { employeeId, onEvent } = useEmployeeSelfOnboardingFlowParams({
    component: 'DocumentSigner',
    requiredParams: ['employeeId'],
  })
  return <Employee.DocumentSigner employeeId={employeeId} onEvent={onEvent} />
}

export function OnboardingSummary() {
  const { employeeId, onEvent } = useEmployeeSelfOnboardingFlowParams({
    component: 'OnboardingSummary',
    requiredParams: ['employeeId'],
  })
  return <Employee.OnboardingSummary employeeId={employeeId} onEvent={onEvent} isAdmin={false} />
}
