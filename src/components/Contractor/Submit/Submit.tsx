import { useTranslation } from 'react-i18next'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorSubmit } from './useContractorSubmit'
import { SubmitDone } from './SubmitDone'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

export interface ContractorSubmitProps extends CommonComponentInterface<'Contractor.ContractorList'> {
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
  const { Alert, Button, UnorderedList } = useComponentContext()
  const { t } = useTranslation('Contractor.Submit')

  const {
    data: { onboardingStatus, warningItems },
    actions: { onSubmit, handleInviteContractor, handleSubmitDone },
  } = useContractorSubmit({ contractorId, selfOnboarding })

  if (onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED) {
    return <SubmitDone onDone={handleSubmitDone} />
  }
  if (
    onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED &&
    selfOnboarding
  ) {
    return <InviteContractor onSubmit={handleInviteContractor} contractorId={contractorId} />
  }

  return (
    <>
      <Alert label={t('title')} status="warning">
        <UnorderedList items={warningItems} />
      </Alert>
      <Flex flexDirection="column" alignItems="flex-end">
        <Button title={t('submitCta')} onClick={onSubmit}>
          {t('submitCta')}
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
    <Flex flexDirection="column">
      <Heading as="h2">{t('title')}</Heading>
      <Text>{t('description')}</Text>
      <Flex flexDirection="column">
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
