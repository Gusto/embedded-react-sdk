import { useTranslation } from 'react-i18next'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, Button } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import {
  useGetEmployee,
  useGetEmployeeOnboardingStatus,
  useUpdateEmployeeOnboardingStatus,
} from '@/api/queries/employee'
import { useEffect } from 'react'

interface SummaryProps extends CommonComponentInterface {
  employeeId: string
  isAdmin?: boolean
}

export function OnboardingSummary(props: SummaryProps & BaseComponentInterface) {
  useI18n('Employee.OnboardingSummary')

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, className, isAdmin = false }: SummaryProps) => {
  const { onEvent } = useBase()

  const {
    data: { first_name, last_name, company_uuid },
  } = useGetEmployee(employeeId)

  const {
    data: { onboarding_status, onboarding_steps },
  } = useGetEmployeeOnboardingStatus(employeeId)
  const updateEmployeeOnboardingStatusMutation = useUpdateEmployeeOnboardingStatus(company_uuid)
  const { t } = useTranslation('Employee.OnboardingSummary')

  useEffect(() => {
    const asyncSet = async () => {
      if (isAdmin) {
        if (onboarding_status === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE) {
          const updateEmployeeOnboardingStatusResult =
            await updateEmployeeOnboardingStatusMutation.mutateAsync({
              employeeId,
              body: { onboarding_status: EmployeeOnboardingStatus.ONBOARDING_COMPLETED },
            })
          onEvent(
            componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
            updateEmployeeOnboardingStatusResult,
          )
        }
      } else {
        //Self onboarding status handling
        if (
          onboarding_status === EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_STARTED ||
          onboarding_status === EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_OVERDUE
        ) {
          const updateEmployeeOnboardingStatusResult =
            await updateEmployeeOnboardingStatusMutation.mutateAsync({
              employeeId,
              body: {
                onboarding_status: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
              },
            })
          onEvent(
            componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
            updateEmployeeOnboardingStatusResult,
          )
        }
      }
    }
    //TODO: Handle case when used did not complete all onboarding steps (should not be possible with linear flow)
    const incompleteStepIndex = onboarding_steps?.findIndex(
      step => !step.completed && step.required,
    )
    if (incompleteStepIndex !== undefined && incompleteStepIndex > -1) {
      asyncSet()
    }
  }, [onboarding_status])

  return (
    <section className={className}>
      <Flex flexDirection="column" gap="xl">
        <Flex alignItems="center" flexDirection="column" gap="sm">
          <h2>
            {isAdmin
              ? t('onboardedAdminSubtitle', { name: `${first_name} ${last_name}` })
              : t('onboardedSelfSubtitle')}
          </h2>
          <p>{isAdmin ? t('onboardedAdminDescription') : t('onboardedSelfDescription')}</p>
        </Flex>
        {isAdmin && (
          <Flex justifyContent="center">
            <Button
              variant="secondary"
              onPress={() => {
                onEvent(componentEvents.EMPLOYEES_LIST)
              }}
            >
              {t('returnToEmployeeListCta')}
            </Button>
            <Button
              variant="primary"
              onPress={() => {
                onEvent(componentEvents.EMPLOYEE_CREATE)
              }}
            >
              {t('addAnotherCta')}
            </Button>
          </Flex>
        )}
      </Flex>
    </section>
  )
}

export const OnboardingSummaryContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Summary',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <OnboardingSummary employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin} />
}
