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
import { componentEvents } from '@/shared/constants'
import {
  useGetEmployee,
  // useGetEmployeeOnboardingStatus,
} from '@/api/queries/employee'

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

  // const {
  //   data: { onboarding_steps },
  // } = useGetEmployeeOnboardingStatus(employeeId)
  const { t } = useTranslation('Employee.OnboardingSummary')


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
        {/* {onboarding_steps?.length > 0 && onboarding_steps?.map(step => { if (step.required && !step.completed) { return <p>'incompleteStep:' {step.title}</p> } else { return null } })} */}
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
