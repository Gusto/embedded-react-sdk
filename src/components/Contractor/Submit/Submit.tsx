import { useTranslation } from 'react-i18next'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/contractorsGetOnboardingStatus'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
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
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

export interface ContractorSubmitProps
  extends CommonComponentInterface<'Contractor.ContractorList'> {
  contractorId: string
  selfOnboarding?: boolean
}

export function ContractorSubmit(props: ContractorSubmitProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ contractorId, selfOnboarding }: ContractorSubmitProps) => {
  useI18n('Contractor.Submit')
  const { Alert, Button, UnorderedList } = useComponentContext()
  const { t } = useTranslation('Contractor.Submit')
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
          requestBody: { onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED },
        },
      })
      onEvent(
        componentEvents.CONTRACTOR_ONBOARDING_STATUS_UPDATED,
        response.contractorOnboardingStatus,
      )
      onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE)
    })
  }
  const handleInviteContractor = () => {
    onEvent(componentEvents.CONTRACTOR_INVITE_CONTRACTOR, { contractorId })
    onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, {
      message: t('inviteContractor.successMessage'),
    })
  }

  const handleSubmitDone = () => {
    onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, {
      onboardingStatus,
      message: t('submitDone.successMessage'),
    })
  }

  if (onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED) {
    return <SubmitDone onDone={handleSubmitDone} />
  }
  if (
    onboardingStatus === ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE &&
    selfOnboarding
  ) {
    return <InviteContractor onSubmit={handleInviteContractor} contractorId={contractorId} />
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

const InviteContractor = ({
  onSubmit,
  contractorId,
}: {
  onSubmit: () => void
  contractorId: string
}) => {
  const { t } = useTranslation('Contractor.Submit', { keyPrefix: 'inviteContractor' })
  const { Button, Heading, Text } = useComponentContext()

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const contractor = contractorData.contractor

  return (
    <Flex flexDirection="column" alignItems="flex-end">
      <Heading as="h2">{t('title')}</Heading>
      <Text>{t('description')}</Text>
      <Flex flexDirection="column" alignItems="flex-end">
        <div>
          <Text>
            {firstLastName({
              first_name: contractor?.firstName,
              last_name: contractor?.lastName,
            })}
          </Text>
          <Text>{contractor?.email}</Text>
        </div>
        <div>
          <Text>{t('startDateLabel')}</Text>
          <Text>{contractor?.startDate}</Text>
        </div>
      </Flex>
      <Button title={t('inviteCta')} onClick={onSubmit}>
        {t('inviteCta')}
      </Button>
    </Flex>
  )
}
