import type { PrototypeComponent } from '../prototypeTypes'
import { contractorWelcomeConfigurations } from '../../components/contractor/self-onboarding/ContractorWelcome/ContractorWelcomeConfigurations'
import { contractorDocumentListConfigurations } from '../../components/contractor/self-onboarding/ContractorDocumentList/ContractorDocumentListConfigurations'
import { contractorDocumentSignatureConfigurations } from '../../components/contractor/self-onboarding/ContractorDocumentSignature/ContractorDocumentSignatureConfigurations'
import { contractorOnboardingCompleteConfigurations } from '../../components/contractor/self-onboarding/ContractorOnboardingComplete/ContractorOnboardingCompleteConfigurations'
import { profileDetailsFormSelfOnboardingConfigurations } from '../../components/contractor/shared/ProfileDetailsForm/ProfileDetailsFormConfigurations'
import { addressFormSelfOnboardingConfigurations } from '../../components/contractor/shared/AddressForm/AddressFormConfigurations'
import { paymentMethodFormSelfOnboardingConfigurations } from '../../components/contractor/shared/PaymentMethodForm/PaymentMethodFormConfigurations'

export const components: PrototypeComponent[] = [
  { slug: 'welcome', name: 'Welcome', configurations: contractorWelcomeConfigurations },
  {
    slug: 'profile-details',
    name: 'Profile Details',
    configurations: profileDetailsFormSelfOnboardingConfigurations,
  },
  {
    slug: 'address-form',
    name: 'Address Form',
    configurations: addressFormSelfOnboardingConfigurations,
  },
  {
    slug: 'payment-method-form',
    name: 'Payment Method Form',
    configurations: paymentMethodFormSelfOnboardingConfigurations,
  },
  {
    slug: 'document-list',
    name: 'Document List',
    configurations: contractorDocumentListConfigurations,
  },
  {
    slug: 'document-signature',
    name: 'Document Signature',
    configurations: contractorDocumentSignatureConfigurations,
  },
  {
    slug: 'onboarding-complete',
    name: 'Onboarding Complete',
    configurations: contractorOnboardingCompleteConfigurations,
  },
]
