import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
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
import type { WithRequired } from '@/types/Helpers'

interface ContractorProfileProps extends CommonComponentInterface<'Contractor.Profile'> {
  companyId: string
  contractorId?: string
  defaultValues?: UseContractorProfileProps['defaultValues']
}

interface ContractorProfileConditionalProps {
  existingContractor?: Contractor
}

// Container component - calls hook and passes data to presentation component
export function ContractorProfile(props: ContractorProfileProps & BaseComponentInterface) {
  useComponentDictionary('Contractor.Profile', props.dictionary)
  return (
    <BaseComponent {...props}>
      {props.contractorId ? (
        <RootWithContractor {...props} contractorId={props.contractorId}>
          {props.children}
        </RootWithContractor>
      ) : (
        <Root {...props}>{props.children}</Root>
      )}
    </BaseComponent>
  )
}

/**Accounting for conditional logic where contractor data needs to be fetched only if contractorId is present */
function RootWithContractor(props: WithRequired<ContractorProfileProps, 'contractorId'>) {
  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: props.contractorId })
  return <Root {...props} existingContractor={contractor} />
}

function Root({
  companyId,
  contractorId,
  defaultValues,
  existingContractor,
  className,
}: ContractorProfileProps & ContractorProfileConditionalProps) {
  const hookData = useContractorProfile({
    companyId,
    contractorId,
    defaultValues,
    existingContractor,
  })
  return (
    <ContractorProfileForm
      {...hookData}
      existingContractor={existingContractor}
      className={className}
    />
  )
}

// Re-export types and enums for convenience
export { ContractorType, WageType }
export type { UseContractorProfileProps as ContractorProfileFormData }

// Re-export the form component for convenience
export { ContractorProfileForm } from './ContractorProfileForm'
