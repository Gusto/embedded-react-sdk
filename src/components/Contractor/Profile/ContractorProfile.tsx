import { useContractorsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsGet'
import type { Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import type { ContractorProfileFormData } from './useContractorProfile'
import { useContractorProfile } from './useContractorProfile'
import { ContractorProfileForm } from './ContractorProfileForm'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import type { WithRequired } from '@/types/Helpers'

/**
 * Props for {@link ContractorProfile}.
 *
 * @public
 */
export interface ContractorProfileProps extends BaseComponentInterface<'Contractor.Profile'> {
  /** UUID of the company the contractor belongs to. */
  companyId: string
  /** UUID of an existing contractor to edit. When omitted, the form creates a new contractor. */
  contractorId?: string
  /** Initial values for the contractor profile form fields. */
  defaultValues?: Partial<ContractorProfileFormData>
}

interface ContractorProfileConditionalProps {
  existingContractor?: Contractor
}

/**
 * Form for creating or editing a contractor profile, supporting both individual and business contractor types.
 *
 * @remarks
 * Renders different field sets depending on the contractor type (individual vs. business) and wage type
 * (hourly vs. fixed), and exposes a self-onboarding toggle that invites the contractor to complete their
 * own setup. When `contractorId` is provided, the form fetches the existing contractor and updates it on
 * submit; otherwise it creates a new contractor under `companyId`.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/created` | A new contractor was created successfully. | The created contractor entity |
 * | `contractor/updated` | An existing contractor was updated successfully. | The updated contractor entity |
 * | `contractor/profile/done` | The contractor profile step finished. | `{ contractorId: string, selfOnboarding: boolean }` |
 *
 * @param props - See {@link ContractorProfileProps}.
 * @returns The rendered contractor profile form.
 * @public
 */
export function ContractorProfile(props: ContractorProfileProps) {
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
