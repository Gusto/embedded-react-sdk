import { type Form } from '@gusto/embedded-api/models/components/form'
import { DocumentList } from './DocumentList/DocumentList'
import { SignatureForm } from './SignatureForm/SignatureForm'
import { EmploymentEligibility } from './EmploymentEligibility'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.EMPLOYEE_SIGN_FORM]: Form
  [componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN]: { uuid: string }
  [componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE]: unknown
  [componentEvents.CANCEL]: undefined
}

export interface DocumentSignerContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
  withEmployeeI9?: boolean
}

export function DocumentListContextual() {
  const { employeeId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <DocumentList employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function SignatureFormContextual() {
  const { employeeId, formId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <SignatureForm
      employeeId={ensureRequired(employeeId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}

export function EmploymentEligibilityContextual() {
  const { employeeId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <EmploymentEligibility employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
