import { useTranslation } from 'react-i18next'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsGetOnboardingStatus'
import { useContractorsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsGet'
import { SubmitDone } from './SubmitDone'
import { ActionsLayout, Flex, FlexItem } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n, useComponentDictionary } from '@/i18n'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

/**
 * Props for {@link ContractorSubmit}.
 *
 * @public
 */
export interface ContractorSubmitProps extends CommonComponentInterface<'Contractor.Submit'> {
  /** UUID of the contractor being submitted. */
  contractorId: string
  /** When true, adjusts the submission for the self-onboarding flow, surfacing the invite step before the contractor's onboarding status is finalized. */
  selfOnboarding?: boolean
}

/**
 * Finalizes contractor onboarding by updating the onboarding status, and in the self-onboarding flow can trigger an invitation to the contractor.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/onboardingStatus/updated` | The contractor's onboarding status was successfully updated. | The updated `contractorOnboardingStatus` returned by the API. |
 * | `contractor/invite/selfOnboarding` | The invite action was triggered for a self-onboarding contractor. | `{ contractorId: string }` |
 * | `contractor/submit/done` | The submission step finished — fired after a successful status update, after an invite, or when the contractor was already onboarded. | `{ message: string }`, optionally with `onboardingStatus` when the contractor was already completed. |
 *
 * @param props - See {@link ContractorSubmitProps}.
 * @returns The rendered submission step.
 * @public
 */
export function ContractorSubmit(props: ContractorSubmitProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ contractorId, selfOnboarding, dictionary }: ContractorSubmitProps) => {
  useI18n('Contractor.Submit')
  useComponentDictionary('Contractor.Submit', dictionary)
  const { Alert, Box, BoxHeader, Button, Text, Heading, UnorderedList } = useComponentContext()
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
          contractorOnboardingStatusUpdateRequestBody: {
            onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED,
          },
        },
      })
      onEvent(
        componentEvents.CONTRACTOR_ONBOARDING_STATUS_UPDATED,
        response.contractorOnboardingStatus,
      )
      onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, { message: t('submitDone.successMessage') })
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
    onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED &&
    selfOnboarding
  ) {
    return <InviteContractor onSubmit={handleInviteContractor} contractorId={contractorId} />
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <FlexItem>
        <Heading as="h2">{t('heading')}</Heading>
      </FlexItem>

      <Box
        header={
          <BoxHeader
            title={t('documentRequirements.title')}
            description={t('documentRequirements.description')}
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {Object.values(t('documentRequirements.items', { returnObjects: true })).map(item => (
            <div key={item.title}>
              <Text weight="medium">{item.title}</Text>
              <Text variant="supporting">{item.description}</Text>
            </div>
          ))}
          <Alert status="info" label={t('documentRequirements.alertLabel')}></Alert>
        </Flex>
      </Box>
      <Flex flexDirection="column" gap={8}>
        <Alert status="warning" label={t('title')}>
          <UnorderedList items={items} />
        </Alert>
        <ActionsLayout justifyContent="end">
          <Button title={t('submitCta')} onClick={onSubmit}>
            {t('submitCta')}
          </Button>
        </ActionsLayout>
      </Flex>
    </Flex>
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
