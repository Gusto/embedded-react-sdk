import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { ContractorType as ApiContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorUpdateRequestBody } from '@gusto/embedded-api/models/components/contractorupdaterequestbody'
import { ProfileDetailsForm, type ProfileDetailsFormValues } from '../common/ProfileDetailsForm'
import { BaseComponent, useBase } from '@/components/Base'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { componentEvents } from '@/shared/constants'

interface ContractorSelfProfileProps {
  contractorId: string
  onEvent: (...args: unknown[]) => void
}

export function ContractorSelfProfile(props: ContractorSelfProfileProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} />
    </BaseComponent>
  )
}

function Root({ contractorId }: { contractorId: string }) {
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateContractor, isPending } = useContractorsUpdateMutation()

  const isIndividual = contractor?.type === ApiContractorType.Individual

  const handleSubmit = async (data: ProfileDetailsFormValues) => {
    await baseSubmitHandler(data, async () => {
      const payload: ContractorUpdateRequestBody = {
        version: contractor!.version!,
        type: contractor!.type!,
        selfOnboarding: true,
        ...(isIndividual
          ? {
              firstName: data.firstName,
              middleInitial: data.middleInitial || undefined,
              lastName: data.lastName,
              ssn: data.ssn ? removeNonDigits(data.ssn) : undefined,
            }
          : {
              businessName: data.businessName,
              ein: data.ein ? data.ein.replace(/-/g, '') : undefined,
            }),
      }

      await updateContractor({
        request: {
          contractorUuid: contractorId,
          contractorUpdateRequestBody: payload,
        },
      })

      onEvent(componentEvents.CONTRACTOR_PROFILE_DONE, {
        contractorId,
        selfOnboarding: true,
      })
    })
  }

  return (
    <ProfileDetailsForm
      contractor={contractor!}
      heading="Complete your profile"
      description={
        isIndividual
          ? 'Please verify your name and provide your Social Security Number.'
          : 'Please verify your business name and provide your EIN.'
      }
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  )
}
