import { fn } from 'storybook/test'
import { EmploymentEligibilityPresentation } from './EmploymentEligibilityPresentation'

export default {
  title: 'Domain/Employee/EmploymentEligibility',
}

const handleSubmit = fn().mockName('onSubmit')

export const Default = () => <EmploymentEligibilityPresentation onSubmit={handleSubmit} />

export const Citizen = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{ eligibilityStatus: 'citizen' }}
  />
)

export const LawfulPermanentResident = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      eligibilityStatus: 'lawfulPermanentResident',
      uscisNumber: 'A123456789',
    }}
  />
)

export const NoncitzenAuthorizedWithUSCIS = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      eligibilityStatus: 'noncitizen_authorized',
      authorizedToWorkUntil: new Date('2025-12-31'),
      authorizationDocumentType: 'uscis',
      uscisNumber: 'A987654321',
    }}
  />
)

export const NoncitzenAuthorizedWithI94 = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      eligibilityStatus: 'noncitizen_authorized',
      authorizedToWorkUntil: new Date('2025-06-30'),
      authorizationDocumentType: 'i94',
      i94AdmissionNumber: '12345678901',
    }}
  />
)

export const NoncitzenAuthorizedWithForeignPassport = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      eligibilityStatus: 'noncitizen_authorized',
      authorizedToWorkUntil: new Date('2026-01-15'),
      authorizationDocumentType: 'foreignPassport',
      foreignPassportNumber: 'AB1234567',
      countryOfIssuance: 'US',
    }}
  />
)
