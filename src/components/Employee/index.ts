export { EmployeeList } from './EmployeeList/EmployeeList'
export { Deductions } from './Deductions'
export { OnboardingSummary } from './OnboardingSummary'
export { Profile } from './Profile'
export { Compensation } from './Compensation'
export { FederalTaxes } from './FederalTaxes'
export { StateTaxes } from './StateTaxes'
export { PaymentMethod } from './PaymentMethod'
export { Landing } from './Landing'
export { DocumentSigner } from './DocumentSigner'
export { OnboardingFlow } from './OnboardingFlow/OnboardingFlow'
export { SelfOnboardingFlow } from './SelfOnboardingFlow/SelfOnboardingFlow'
export { EmployeeDocuments } from './EmployeeDocuments'

export { EmploymentEligibility } from './DocumentSigner/EmploymentEligibility'
export type { EmploymentEligibilityProps } from './DocumentSigner/EmploymentEligibility'

// TODO: Remove once we have migrated partners to use the new FederalTaxes and StateTaxes components
export { Taxes } from './Taxes'

export { ExampleAdminProfile } from './UNSTABLE_AdminProfile'
export { ExampleEmployeeProfile } from './UNSTABLE_EmployeeProfile'
export {
  useEmployeeDetails,
  EmployeeDetailsFields,
  type EmployeeDetailsFieldsMetadata,
} from './UNSTABLE_EmployeeDetailsForm'
export {
  useEmployeeHomeAddress,
  HomeAddressFields,
  type HomeAddressFieldsMetadata,
} from './UNSTABLE_EmployeeHomeAddressForm'
export {
  useEmployeeWorkAddress,
  WorkAddressFields,
  type WorkAddressFieldsMetadata,
} from './UNSTABLE_EmployeeWorkAddressForm'
export { ExampleCompensationForm } from './UNSTABLE_CompensationForm'
export {
  useCompensationForm,
  CompensationFields,
  type CompensationFieldsMetadata,
} from './UNSTABLE_CompensationForm'
