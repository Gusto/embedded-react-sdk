import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeFormsListSuspense } from '@gusto/embedded-api/react-query/employeeFormsList'
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

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: formsData } = useEmployeeFormsListSuspense({ employeeId })

  const employeeHasI9Enabled = employeeData.employee?.onboardingDocumentsConfig?.i9Document === true

  const i9Form = formsData.formList?.find(form => form.name === I9_FORM_NAME)
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
    [employeeId, needsI9Form, withEmployeeI9],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
