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
    defaultValues={{ authorizationStatus: 'citizen' }}
  />
)

export const LawfulPermanentResident = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      authorizationStatus: 'permanent_resident',
      documentNumber: 'A123456789',
    }}
  />
)

export const NoncitzenAuthorizedWithUSCIS = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      authorizationStatus: 'alien',
      expirationDate: new Date('2025-12-31'),
      documentType: 'uscis_alien_registration_number',
      documentNumber: 'A987654321',
    }}
  />
)

export const NoncitzenAuthorizedWithI94 = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      authorizationStatus: 'alien',
      expirationDate: new Date('2025-06-30'),
      documentType: 'form_i94',
      documentNumber: '12345678901',
    }}
  />
)

export const NoncitzenAuthorizedWithForeignPassport = () => (
  <EmploymentEligibilityPresentation
    onSubmit={handleSubmit}
    defaultValues={{
      authorizationStatus: 'alien',
      expirationDate: new Date('2026-01-15'),
      documentType: 'foreign_passport',
      documentNumber: 'AB1234567',
      country: 'CA',
    }}
  />
)
