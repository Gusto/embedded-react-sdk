import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/contractorsGetOnboardingStatus'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout, Flex, FlexItem } from '@/components/Common'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

interface ContractorSubmitProps {
  contractorId: string
  selfOnboarding?: boolean
  onEvent: (eventType: string, data?: unknown) => void
}

export function ContractorSubmit(props: ContractorSubmitProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} selfOnboarding={props.selfOnboarding} />
    </BaseComponent>
  )
}

function Root({
  contractorId,
  selfOnboarding,
}: {
  contractorId: string
  selfOnboarding?: boolean
}) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { Alert, Box, BoxHeader, Button, Text, Heading, UnorderedList } = useComponentContext()

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
      onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, { message: 'Contractor added successfully' })
    })
  }

  const handleInviteContractor = () => {
    onEvent(componentEvents.CONTRACTOR_INVITE_CONTRACTOR, { contractorId })
    onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, {
      message: 'Invitation sent successfully',
    })
  }

  const handleSubmitDone = () => {
    onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE, {
      onboardingStatus,
      message: 'Contractor added successfully',
    })
  }

  if (onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED) {
    return (
      <Flex flexDirection="column" alignItems="center">
        <Heading as="h2">Contractor onboarded</Heading>
        <Text>This contractor has been successfully onboarded.</Text>
        <Button variant="secondary" onClick={handleSubmitDone}>
          Done
        </Button>
      </Flex>
    )
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
        <Heading as="h2">Review and submit</Heading>
      </FlexItem>

      <Box
        header={
          <BoxHeader
            title="Required documents"
            description="The following documents will be generated after the contractor is added."
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          <div>
            <Text weight="medium">W-9</Text>
            <Text variant="supporting">
              Request for Taxpayer Identification Number and Certification
            </Text>
          </div>
          <Alert
            status="info"
            label="Documents will be available for review and signing after the contractor is added."
          />
        </Flex>
      </Box>

      <Flex flexDirection="column" gap={8}>
        <Alert status="warning" label="Before you submit">
          <UnorderedList
            items={[
              'Make sure all information is accurate before submitting.',
              'The contractor will be created in Gusto after submission.',
            ]}
          />
        </Alert>
        <ActionsLayout justifyContent="end">
          <Button title="Submit contractor" onClick={onSubmit}>
            Submit contractor
          </Button>
        </ActionsLayout>
      </Flex>
    </Flex>
  )
}

function InviteContractor({
  onSubmit,
  contractorId,
}: {
  onSubmit: () => void
  contractorId: string
}) {
  const { Button, Heading, Text } = useComponentContext()

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const contractor = contractorData.contractor

  return (
    <Flex flexDirection="column">
      <Heading as="h2">Invite contractor</Heading>
      <Text>
        This contractor has been set up for self-onboarding. Send them an invitation to complete
        their profile.
      </Text>
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
          <Text>Start date</Text>
          <Text>{contractor?.startDate}</Text>
        </div>
      </Flex>
      <Button title="Send invitation" onClick={onSubmit}>
        Send invitation
      </Button>
    </Flex>
  )
}
