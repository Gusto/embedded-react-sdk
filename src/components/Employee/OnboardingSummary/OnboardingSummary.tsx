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
import { useGetEmployee, useGetEmployeeOnboardingStatus } from '@/api/queries/employee'

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
    data: { first_name, last_name },
  } = useGetEmployee(employeeId)

  const {
    data: { onboarding_steps, onboarding_status },
  } = useGetEmployeeOnboardingStatus(employeeId)
  const { t } = useTranslation('Employee.OnboardingSummary')

  const hasMissingRequirements =
    onboarding_steps?.length &&
    onboarding_steps.findIndex(step => step.required && !step.completed) > -1
  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          {isAdmin ? (
            onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
            (!hasMissingRequirements &&
              onboarding_status === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE) ? (
              <>
                <h2>{t('onboardedAdminSubtitle', { name: `${first_name} ${last_name}` })}</h2>
                <p>{t('onboardedAdminDescription')}</p>
              </>
            ) : (
              <>
                <h2>{t('missingRequirementsSubtitle')}</h2>
                <p>{t('missingRequirementsDescription')}</p>
                <ul>
                  {onboarding_steps?.map(step => {
                    if (step.required && !step.completed) {
                      return (
                        <li key={step.id}>
                          {/* @ts-expect-error: id has typeof keyof steps */}
                          <h4>{t(`steps.${step.id}`, step.title)}</h4>
                          {/* @ts-expect-error: id has typeof keyof steps */}
                          <p>{t(`stepsDescriptions.${step.id}`)}</p>
                        </li>
                      )
                    } else {
                      return null
                    }
                  })}
                </ul>
              </>
            )
          ) : (
            <>
              <h2>{t('onboardedSelfSubtitle')}</h2>
              <p>{t('onboardedSelfDescription')}</p>
            </>
          )}
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
