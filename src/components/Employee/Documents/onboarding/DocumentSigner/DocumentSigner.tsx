import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import { useEmployeeFormsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeFormsList'
import {
  DocumentListContextual,
  EmploymentEligibilityContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { I9_FORM_NAME } from '@/shared/constants'

/**
 * Props for {@link DocumentSigner}.
 *
 * @public
 */
export interface DocumentSignerProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  /** The associated employee identifier. */
  employeeId: string
  /** When `true`, the flow routes through I-9 employment eligibility before listing documents for signing. Defaults to `false`. */
  withEmployeeI9?: boolean
}

/**
 * Onboarding step for signing employee documents.
 *
 * @remarks
 * Lists the employee's pending forms and routes through the signing UI for each
 * one. When `withEmployeeI9` is `true` and the employee's I-9 has not been
 * signed, the flow starts on the I-9 employment eligibility step before
 * presenting the document list.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/employmentEligibility/done` | Fired after I-9 employment eligibility is captured | The updated I-9 authorization |
 * | `employee/forms/view` | Fired when a form's "Sign" action is selected from the document list | `{ uuid: string; name?: string }` |
 * | `employee/forms/sign` | Fired after a form is successfully signed | {@link APIModels.Form} |
 * | `employee/employmentEligibility/change` | Fired when the user requests to change their I-9 eligibility status | — |
 * | `employee/forms/done` | Fired when all required forms have been signed and the parent flow can advance | — |
 * | `cancel` | Fired when the user cancels signing a form and returns to the document list | — |
 *
 * @components
 * - {@link EmploymentEligibility}
 * - {@link I9SignatureForm}
 * - {@link DocumentList}
 * - {@link SignatureForm}
 *
 * @param props - See {@link DocumentSignerProps}.
 * @returns The document signer flow.
 * @public
 */
export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, onEvent, dictionary, withEmployeeI9 = false }: DocumentSignerProps) {
  useComponentDictionary('Employee.DocumentSigner', dictionary)

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: formsData } = useEmployeeFormsListSuspense({ employeeId })

  const employeeHasI9Enabled = employeeData.employee?.onboardingDocumentsConfig?.i9Document === true

  const i9Form = formsData.forms?.find(form => form.name === I9_FORM_NAME)
  const needsI9Form =
    withEmployeeI9 && employeeHasI9Enabled && (!i9Form || i9Form.requiresSigning === true)

  const machine = useMemo(
    () =>
      createMachine(
        needsI9Form ? 'employmentEligibility' : 'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: needsI9Form ? EmploymentEligibilityContextual : DocumentListContextual,
          employeeId,
          withEmployeeI9,
        }),
      ),
    [employeeId, withEmployeeI9],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
