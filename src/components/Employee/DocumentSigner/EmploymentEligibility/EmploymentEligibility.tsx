import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { useI9VerificationGetAuthorization } from '@gusto/embedded-api/react-query/i9VerificationGetAuthorization'
import { useI9VerificationUpdateMutation } from '@gusto/embedded-api/react-query/i9VerificationUpdate'
import { EmploymentEligibilityPresentation } from './EmploymentEligibilityPresentation'
import type {
  EmploymentEligibilityInputs,
  EmploymentEligibilityPayload,
} from './EmploymentEligibilitySchema'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface EmploymentEligibilityProps extends BaseComponentInterface<'Employee.EmploymentEligibility'> {
  employeeId: string
}

export function EmploymentEligibility(props: EmploymentEligibilityProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({ employeeId, dictionary }: EmploymentEligibilityProps) => {
  useComponentDictionary('Employee.EmploymentEligibility', dictionary)
  useI18n('Employee.EmploymentEligibility')
  const { onEvent, baseSubmitHandler, LoadingIndicator } = useBase()

  const { data: i9AuthData, isLoading } = useI9VerificationGetAuthorization(
    { employeeId },
    {
      retry: false,
      throwOnError: (error: Error) => {
        return !(error instanceof APIError && error.httpMeta.response.status === 404)
      },
    },
  )

  const existingAuth = i9AuthData?.i9Authorization

  const { mutateAsync: updateI9Authorization, isPending } = useI9VerificationUpdateMutation()

  const handleSubmit = async (data: EmploymentEligibilityPayload) => {
    await baseSubmitHandler(data, async payload => {
      const { authorizationStatus, documentType, documentNumber, expirationDate, country } = payload

      if (!authorizationStatus) return

      const result = await updateI9Authorization({
        request: {
          employeeId,
          requestBody: {
            authorizationStatus,
            version: existingAuth?.version,
            ...(authorizationStatus === 'permanent_resident' &&
              documentNumber && {
                documentType: 'uscis_alien_registration_number',
                documentNumber,
              }),
            ...(authorizationStatus === 'alien' && {
              ...(documentNumber && documentType && { documentType, documentNumber }),
              expirationDate,
              ...(documentType === 'foreign_passport' && { country }),
            }),
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE, result.i9Authorization)
    })
  }

  const defaultValues: Partial<EmploymentEligibilityInputs> = existingAuth
    ? {
        authorizationStatus: existingAuth.authorizationStatus,
        documentType: existingAuth.documentType ?? undefined,
        expirationDate: existingAuth.expirationDate
          ? new Date(existingAuth.expirationDate)
          : undefined,
        country: existingAuth.country ?? undefined,
      }
    : {}

  if (!isPending && isLoading) return <LoadingIndicator />

  return (
    <EmploymentEligibilityPresentation
      key={existingAuth?.uuid}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      hasDocumentNumber={existingAuth?.hasDocumentNumber}
      isPending={isPending}
    />
  )
}
