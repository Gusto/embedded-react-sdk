import { useCompanyOnboardingOverview } from './useCompanyOnboardingOverview'
import { OnboardingOverviewProvider } from './context'
import { MissingRequirements } from './MissingRequirements'
import { Completed } from './Completed'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common'
import { useComponentDictionary } from '@/i18n/I18n'

interface OnboardingOverviewProps extends CommonComponentInterface<'Company.OnboardingOverview'> {
  companyId: string
}

export function OnboardingOverview(props: OnboardingOverviewProps & BaseComponentInterface) {
  useI18n('Company.OnboardingOverview')
  useComponentDictionary('Company.OnboardingOverview', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, className, children }: OnboardingOverviewProps) => {
  const {
    data: { onboardingCompleted, onboardingSteps },
    actions: { handleDone, handleContinue },
  } = useCompanyOnboardingOverview({ companyId })

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
