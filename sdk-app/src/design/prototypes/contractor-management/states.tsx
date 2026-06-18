import type { PrototypeComponent } from '../prototypeTypes'
import { contractorListConfigurations } from '../../components/contractor/management/ContractorList/ContractorListConfigurations'
import { contractorDetailsConfigurations } from '../../components/contractor/management/ContractorDetails/ContractorDetailsConfigurations'
import { contractorDismissalFormConfigurations } from '../../components/contractor/management/ContractorDismissalForm/ContractorDismissalFormConfigurations'
import { profileDetailsFormManagementConfigurations } from '../../components/contractor/shared/ProfileDetailsForm/ProfileDetailsFormConfigurations'
import { addressFormManagementConfigurations } from '../../components/contractor/shared/AddressForm/AddressFormConfigurations'
import { paymentMethodFormManagementConfigurations } from '../../components/contractor/shared/PaymentMethodForm/PaymentMethodFormConfigurations'

export const components: PrototypeComponent[] = [
  { slug: 'list', name: 'List', configurations: contractorListConfigurations },
  {
    slug: 'dismissal-form',
    name: 'Dismissal Form',
    configurations: contractorDismissalFormConfigurations,
  },
  {
    slug: 'basic-details',
    name: 'Basic Details',
    configurations: contractorDetailsConfigurations,
  },
  {
    slug: 'profile-details-form',
    name: 'Profile Details Form',
    configurations: profileDetailsFormManagementConfigurations,
  },
  {
    slug: 'address-form',
    name: 'Address Form',
    configurations: addressFormManagementConfigurations,
  },
  {
    slug: 'payment-method-form',
    name: 'Payment Method Form',
    configurations: paymentMethodFormManagementConfigurations,
  },
]
