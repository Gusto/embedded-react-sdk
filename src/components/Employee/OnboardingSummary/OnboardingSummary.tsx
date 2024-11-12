import { Button } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { useGetEmployee, useGetEmployeeOnboardingStatus } from '@/api/queries/employee'

interface SummaryProps extends CommonComponentInterface {
  employeeId: string
}
export function OnboardingSummary(props: SummaryProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
const Root = ({ employeeId, className }: SummaryProps) => {
  const { onEvent } = useBase()

  const {
    data: { onboarding_status, onboarding_steps },
  } = useGetEmployeeOnboardingStatus(employeeId)
  const {
    data: { first_name, last_name },
  } = useGetEmployee(employeeId)
  useI18n('Employee.OnboardingSummary')
  const { t } = useTranslation('Employee.OnboardingSummary')

  const renderOnboarderd = () => (
    <section className={className}>
      <h2>{t('onboardedSubtitle', { name: `${first_name} ${last_name}` })}</h2>
      <p>{t('onboardedDescription')}</p>
      <Flex>
        <Button
          onPress={() => {
            onEvent(componentEvents.EMPLOYEES_LIST)
          }}
        >
          {t('returnToEmployeeListCta')}
        </Button>
        <Button
          onPress={() => {
            onEvent(componentEvents.EMPLOYEE_CREATE)
          }}
        >
          {t('addAnotherCta')}
        </Button>
      </Flex>
    </section>
  )
  const renderIncomplete = () => (
    <section className={className}>
      <h2>{t('subTitle')}</h2>
      <p>{t('description')}</p>
      <ul>
        {onboarding_steps?.map(step => (
          <li key={step.id}>
            {step.completed ? '✓' : '-'}
            {/* eslint-disable @typescript-eslint/restrict-template-expressions */}
            {t(`steps.${step.id}`, step.title)}
          </li>
        ))}
      </ul>
      <Button
        onPress={() => {
          onEvent(componentEvents.EMPLOYEE_FILE_NEW_HIRE_REPORT)
        }}
      >
        {t('newHireReportCta')}
      </Button>
    </section>
  )

  return (
    <>
      {onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED
        ? renderOnboarderd()
        : renderIncomplete()}
    </>
  )
}

export const OnboardingSummaryContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
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
  return <OnboardingSummary employeeId={employeeId} onEvent={onEvent} />
}
