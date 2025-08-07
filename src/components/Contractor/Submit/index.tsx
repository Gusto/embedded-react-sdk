import { useTranslation } from 'react-i18next'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/contractorsGetOnboardingStatus'
import { SubmitDone } from './SubmitDone'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface ContractorSubmitProps
  extends CommonComponentInterface<'Contractor.ContractorList'> {
  contractorId: string
}

export function ContractorSubmit(props: ContractorSubmitProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ contractorId }: ContractorSubmitProps) => {
  useI18n('Contractor.ContractorSubmit')
  const { Alert, Button, UnorderedList } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorSubmit')
  const { onEvent, baseSubmitHandler } = useBase()
  const items = Object.values(t('warningItems', { returnObjects: true }))

  const { data } = useContractorsGetOnboardingStatusSuspense({
    contractorUuid: contractorId,
  })
  const onboardingStatus = data.contractorOnboardingStatus?.onboardingStatus

  const { mutateAsync } = useContractorsUpdateOnboardingStatusMutation()

  const onSubmit = async () => {
    await baseSubmitHandler(null, async () => {
      const response = await mutateAsync({
        request: {
          contractorUuid: contractorId,
          requestBody: { onboardingStatus: 'onboarding_completed' },
        },
      })
      onEvent(
        componentEvents.CONTRACTOR_ONBOARDING_STATUS_UPDATED,
        response.contractorOnboardingStatus,
      )
    })
  }
  if (onboardingStatus === 'onboarding_completed') {
    return (
      <SubmitDone
        onDone={() => {
          onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, onboardingStatus)
        }}
      />
    )
  }

  return (
    <>
      <Alert label={t('title')} status="warning">
        <UnorderedList items={items} />
      </Alert>
      <Flex flexDirection="column" alignItems="flex-end">
        <Button title={t('submitCTA')} onClick={onSubmit}>
          {t('submitCTA')}
        </Button>
      </Flex>
    </>
  )
}
