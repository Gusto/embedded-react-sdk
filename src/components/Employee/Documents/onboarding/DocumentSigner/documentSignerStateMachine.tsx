import { type Form } from '@gusto/embedded-api-v-2026-02-01/models/components/form'
import { SignatureForm } from '../../shared/SignatureForm/SignatureForm'
import { EmploymentEligibility } from './EmploymentEligibility'
import { I9SignatureForm } from './I9SignatureForm/I9SignatureForm'
import { DocumentList } from './DocumentList/DocumentList'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [componentEvents.EMPLOYEE_SIGN_FORM]: Form
  [componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN]: { uuid: string; name?: string }
  [componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE]: unknown
  [componentEvents.EMPLOYEE_CHANGE_ELIGIBILITY_STATUS]: undefined
  [componentEvents.CANCEL]: undefined
}

/** @internal */
export interface DocumentSignerContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
  withEmployeeI9?: boolean
  isI9Form?: boolean
}

/** @internal */
export function DocumentListContextual() {
  const { employeeId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <DocumentList employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
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

/** @internal */
export function EmploymentEligibilityContextual() {
  const { employeeId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <EmploymentEligibility employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function I9SignatureFormContextual() {
  const { employeeId, formId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <I9SignatureForm
      employeeId={ensureRequired(employeeId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}
