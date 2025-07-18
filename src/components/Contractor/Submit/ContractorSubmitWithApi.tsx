import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useState } from 'react'
import { SubmitDone } from './SubmitDone'
import { ContractorSubmit } from '.'

interface ContractorSubmitWithApiProps {
  contractorUuid: string
  onDone: () => void
}

export const ContractorSubmitWithApi = ({
  contractorUuid,
  onDone,
}: ContractorSubmitWithApiProps) => {
  const [isDone, setIsDone] = useState(false)
  const onSuccess = () => {
    setIsDone(true)
  }
  const { mutateAsync } = useContractorsUpdateOnboardingStatusMutation({ onSuccess })

  const onSubmit = async () => {
    await mutateAsync({
      request: {
        contractorUuid,
        requestBody: {
          onboardingStatus: 'onboarding_completed',
        },
      },
    })
  }

  return isDone ? <SubmitDone onDone={onDone} /> : <ContractorSubmit onSubmit={onSubmit} />
}
