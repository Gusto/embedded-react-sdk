import { fn } from 'storybook/test'
import { EmployeeDocumentsPresentation } from './EmployeeDocumentsPresentation'

export default {
  title: 'Domain/Employee/EmployeeDocuments',
}

const handleSubmit = fn().mockName('onSubmit')
const handleContinue = fn().mockName('onContinue')

export const SelfOnboardingWithI9Unchecked = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboarding={true}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={false}
  />
)

export const SelfOnboardingWithI9Checked = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboarding={true}
    currentI9Status={true}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={false}
  />
)

export const NotSelfOnboarding = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboarding={false}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={false}
  />
)

export const SelfOnboardingLoading = () => (
  <EmployeeDocumentsPresentation
    isSelfOnboarding={true}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onContinue={handleContinue}
    isPending={true}
  />
)
