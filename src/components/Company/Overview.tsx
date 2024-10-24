import { useGetCompanyOnboardingStatus } from '@/api/queries/company'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Button } from '@/components/Common'
import { useFlow, type CompanyOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { companyEvents } from '@/shared/constants'

interface OverviewInterface {
  companyId: string
}

export const Overview = (props: OverviewInterface & BaseComponentInterface) => {
  const { companyId, onEvent } = props
  useI18n('Employee.OnboardingSummary')
  const {
    data: { onboarding_steps },
  } = useGetCompanyOnboardingStatus(companyId)

  return (
    <BaseComponent {...props}>
      <h1>Company Onboarding Overview</h1>
      <hr />
      <ul>
        {onboarding_steps?.map(step => (
          <li key={step.id}>
            {step.completed ? '✓' : '-'}
            {}
            {/* {t(`steps.${step.id}`, step.title)} */}
            {step.title}
          </li>
        ))}
      </ul>
      <Button
        onPress={() => {
          onEvent(companyEvents.COMPANY_INDUSTRY)
        }}
      >
        Industry
      </Button>
      <Button
        onPress={() => {
          onEvent(companyEvents.COMPANY_ADDRESSES)
        }}
      >
        Addresses
      </Button>
    </BaseComponent>
  )
}

export const OverviewContextual = () => {
  const { companyId, onEvent } = useFlow<CompanyOnboardingContextInterface>()
  return <Overview companyId={companyId} onEvent={onEvent} />
}
