import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  DocumentListContextual,
  EmploymentEligibilityContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  employeeId: string
  withEmployeeI9?: boolean
}

export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, onEvent, dictionary, withEmployeeI9 = false }: DocumentSignerProps) {
  useComponentDictionary('Employee.DocumentSigner', dictionary)
  useBase()

  // TODO: I9 authorization query temporarily removed to unblock RC verification.
  // The useI9VerificationGetAuthorization call was causing an error boundary retry
  // loop in published builds. Stubbing needsI9Form to false skips the employment
  // eligibility step entirely.
  const needsI9Form = false as boolean

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
    [employeeId, needsI9Form, withEmployeeI9],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
