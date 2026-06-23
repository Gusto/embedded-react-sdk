import { GustoEmbeddedError } from '@gusto/embedded-api-v-2026-02-01/models/errors/gustoembeddederror'
import { useI9VerificationGetAuthorization } from '@gusto/embedded-api-v-2026-02-01/react-query/i9VerificationGetAuthorization'
import { useI9VerificationUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/i9VerificationUpdate'
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

/**
 * Props for {@link EmploymentEligibility}.
 *
 * @public
 */
export interface EmploymentEligibilityProps extends BaseComponentInterface<'Employee.EmploymentEligibility'> {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Captures the employee's I-9 employment eligibility (Section 1) before signing.
 *
 * @remarks
 * Collects the employee's authorization status — U.S. citizen, noncitizen
 * national, permanent resident, or alien authorized to work — and any
 * document details required for that status. Updates the employee's I-9
 * authorization record on submit.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/employmentEligibility/done` | Fired after the I-9 authorization is saved | The updated I-9 authorization |
 *
 * @param props - See {@link EmploymentEligibilityProps}.
 * @returns The employment eligibility form.
 * @public
 */
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
        return !(error instanceof GustoEmbeddedError && error.httpMeta.response.status === 404)
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
          i9AuthorizationRequestBody: {
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
