import { useCompaniesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/companiesGetOnboardingStatus'
import { OnboardingOverviewProvider } from './context'
import { MissingRequirements } from './MissingRequirements'
import { Completed } from './Completed'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common'
import { componentEvents } from '@/shared/constants'

interface OnboardingOverviewProps extends CommonComponentInterface {
  companyId: string
}

export function OnboardingOverview(props: OnboardingOverviewProps & BaseComponentInterface) {
  useI18n('Company.OnboardingOverview')

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, className, children }: OnboardingOverviewProps) => {
  const { onEvent } = useBase()

  const { data } = useCompaniesGetOnboardingStatusSuspense({ companyUuid: companyId })
  const { onboardingCompleted, onboardingSteps } = data.companyOnboardingStatus!

  const handleDone = () => {
    onEvent(componentEvents.COMPANY_OVERVIEW_DONE)
  }
  const handleContinue = () => {
    onEvent(componentEvents.COMPANY_OVERVIEW_CONTINUE)
  }

  return (
    <section className={className}>
      <OnboardingOverviewProvider
        value={{
          onboardingCompleted,
          onboardingSteps,
          handleDone,
          handleContinue,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Completed />
              <MissingRequirements />
            </>
          )}
        </Flex>
      </OnboardingOverviewProvider>
    </section>
  )
}
