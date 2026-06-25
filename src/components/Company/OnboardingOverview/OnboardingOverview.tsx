import { useCompaniesGetOnboardingStatusSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/companiesGetOnboardingStatus'
import { OnboardingOverviewProvider } from './context'
import { MissingRequirements } from './MissingRequirements'
import { Completed } from './Completed'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for the {@link OnboardingOverview} component.
 *
 * @public
 */
export interface OnboardingOverviewProps extends BaseComponentInterface<'Company.OnboardingOverview'> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Displays the company's overall onboarding status, showing completed steps alongside any remaining requirements.
 *
 * @remarks
 * Renders as the landing or summary screen of a company onboarding flow. When `onboardingCompleted`
 * is true, a completion message and "done" action are shown; otherwise a checklist of outstanding
 * steps is rendered with a continue action. Provide `children` to override the default layout while
 * still consuming the onboarding status via context.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/overview/continue` | Fired when the user chooses to continue to the next outstanding onboarding requirement | — |
 * | `company/overview/done` | Fired when the user signals they are done with the overview screen, typically after onboarding ends | — |
 *
 * @param props - Component props including the target `companyId` and standard base/common component options.
 * @returns The rendered onboarding overview section.
 * @public
 */
export function OnboardingOverview(props: OnboardingOverviewProps) {
  useI18n('Company.OnboardingOverview')
  useComponentDictionary('Company.OnboardingOverview', props.dictionary)
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
