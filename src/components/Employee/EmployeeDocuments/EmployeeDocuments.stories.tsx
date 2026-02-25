import { fn } from 'storybook/test'
import { EmployeeDocumentsPresentation } from './EmployeeDocumentsPresentation'

export default {
  title: 'Domain/Employee/EmployeeDocuments',
}

const handleSubmit = fn().mockName('onSubmit')
const handleDone = fn().mockName('onDone')

export const SelfOnboardingWithI9Unchecked = () => (
  <EmployeeDocumentsPresentation
    isEmployeeSelfOnboarding={true}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onDone={handleDone}
    isPending={false}
  />
)

export const SelfOnboardingWithI9Checked = () => (
  <EmployeeDocumentsPresentation
    isEmployeeSelfOnboarding={true}
    currentI9Status={true}
    onSubmit={handleSubmit}
    onDone={handleDone}
    isPending={false}
  />
)

export const NotSelfOnboarding = () => (
  <EmployeeDocumentsPresentation
    isEmployeeSelfOnboarding={false}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onDone={handleDone}
    isPending={false}
  />
)

export const SelfOnboardingLoading = () => (
  <EmployeeDocumentsPresentation
    isEmployeeSelfOnboarding={true}
    currentI9Status={false}
    onSubmit={handleSubmit}
    onDone={handleDone}
    isPending={true}
  />
)
