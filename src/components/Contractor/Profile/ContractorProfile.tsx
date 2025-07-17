import {
  useContractorProfile,
  ContractorType,
  WageType,
  type UseContractorProfileProps,
} from './useContractorProfile'
import { ContractorProfileForm } from './ContractorProfileForm'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n/I18n'

interface ContractorProfileProps extends CommonComponentInterface<'Contractor.Profile'> {
  companyId: string
  contractorId?: string
  defaultValues?: UseContractorProfileProps['defaultValues']
}

// Container component - calls hook and passes data to presentation component
export function ContractorProfile(props: ContractorProfileProps & BaseComponentInterface) {
  useComponentDictionary('Contractor.Profile', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, contractorId, defaultValues, className }: ContractorProfileProps) {
  const hookData = useContractorProfile({
    companyId,
    contractorId,
    defaultValues,
  })

  return <ContractorProfileForm {...hookData} className={className} />
}

// Re-export types and enums for convenience
export { ContractorType, WageType }
export type { UseContractorProfileProps as ContractorProfileFormData }

// Re-export the form component for convenience
export { ContractorProfileForm } from './ContractorProfileForm'
