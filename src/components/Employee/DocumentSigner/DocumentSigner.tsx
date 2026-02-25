import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { useI9VerificationGetAuthorization } from '@gusto/embedded-api/react-query/i9VerificationGetAuthorization'
import { mutationKeyI9VerificationUpdate } from '@gusto/embedded-api/react-query/i9VerificationUpdate'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
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
  const { LoadingIndicator } = useBase()

  const { data: employeeData, isLoading: employeeLoading } = useEmployeesGet(
    { employeeId },
    { enabled: withEmployeeI9 },
  )

  const employeeHasI9Enabled =
    employeeData?.employee?.onboardingDocumentsConfig?.i9Document === true

  const { data: i9AuthData, isLoading: i9AuthLoading } = useI9VerificationGetAuthorization(
    { employeeId },
    {
      enabled: withEmployeeI9 && employeeHasI9Enabled,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      throwOnError: (error: Error) => {
        return !(error instanceof APIError && error.httpMeta.response.status === 404)
      },
    },
  )

  const needsI9Form =
    withEmployeeI9 && employeeHasI9Enabled && !i9AuthData?.i9Authorization?.employeeSigned

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

  const isSubmittingI9 = useIsMutating({ mutationKey: mutationKeyI9VerificationUpdate() }) > 0

  if (!isSubmittingI9 && withEmployeeI9 && (employeeLoading || i9AuthLoading)) {
    return <LoadingIndicator />
  }

  return <Flow machine={machine} onEvent={onEvent} />
}
