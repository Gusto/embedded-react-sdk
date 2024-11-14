import { Button } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { useGetEmployeeOnboardingStatus } from '@/api/queries/employee'
import { useFlow } from '../Flow/useFlow'

interface SummaryProps {
  employeeId: string
}

export const OnboardingSummary = (props: SummaryProps & BaseComponentInterface) => {
  const { employeeId, onEvent } = props
  const {
    data: { onboarding_status, onboarding_steps },
  } = useGetEmployeeOnboardingStatus(employeeId)
  useI18n('Employee.OnboardingSummary')
  const { t } = useTranslation('Employee.OnboardingSummary')

  const renderOnboarderd = () => (
    <BaseComponent {...props}>
      <h2>{t('onboardedSubtitle')}</h2>
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
    </BaseComponent>
  )
  const renderIncomplete = () => (
    <>
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
    </>
  )

  return (
    <>
      <h1>{t('title')}</h1>
      <hr />
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
