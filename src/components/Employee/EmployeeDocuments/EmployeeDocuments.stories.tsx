import { fn } from 'storybook/test'
import { EmployeeDocumentsPresentation } from './EmployeeDocumentsPresentation'

export default {
  title: 'Domain/Employee/EmployeeDocuments',
}

const handleSubmit = fn().mockName('onSubmit')
const handleContinue = fn().mockName('onContinue')

export const SelfOnboardingWithI9Unchecked = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboardingEnabled={true}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={false}
  />
)

export const SelfOnboardingWithI9Checked = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboardingEnabled={true}
    currentI9Status={true}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={false}
  />
)

export const NotSelfOnboarding = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboardingEnabled={false}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={false}
  />
)

export const SelfOnboardingLoading = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboardingEnabled={true}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={true}
  />
)
