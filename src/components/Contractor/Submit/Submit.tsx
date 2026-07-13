import { useTranslation } from 'react-i18next'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/contractorsGetOnboardingStatus'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import { useContractorDocumentsGetPdf } from '@gusto/embedded-api/react-query/contractorDocumentsGetPdf'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { SubmitDone } from './SubmitDone'
import { ActionsLayout, Flex, FlexItem } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n, useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'
import { W9_DOCUMENT_NAME } from '@/components/Contractor/Documents/SignatureForm/useContractorSignatureForm/w9Fields'

/**
 * Props for {@link ContractorSubmit}.
 *
 * @public
 */
export interface ContractorSubmitProps extends BaseComponentInterface<'Contractor.Submit'> {
  /** UUID of the contractor being submitted. */
  contractorId: string
  /** When true, adjusts the submission for the self-onboarding flow, surfacing the invite step before the contractor's onboarding status is finalized. */
  selfOnboarding?: boolean
}

/**
 * Finalizes contractor onboarding by updating the onboarding status, and in the self-onboarding flow can trigger an invitation to the contractor.
 *
 * @events
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
export function ContractorSubmit(props: ContractorSubmitProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ contractorId, selfOnboarding, dictionary }: ContractorSubmitProps) => {
  useI18n('Contractor.Submit')
  useComponentDictionary('Contractor.Submit', dictionary)
  const { Alert, Box, BoxHeader, Button, Heading, UnorderedList } = useComponentContext()
  const { t } = useTranslation('Contractor.Submit')
  const { onEvent, baseSubmitHandler } = useBase()
  const items = Object.values(t('warningItems', { returnObjects: true }))

  const { data } = useContractorsGetOnboardingStatusSuspense({
    contractorUuid: contractorId,
  })
  const onboardingStatus = data.contractorOnboardingStatus?.onboardingStatus

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const contractor = contractorData.contractor
  const contractorName =
    contractor?.type === 'Individual' ? contractor.firstName : contractor?.businessName

  const { data: documentsData } = useContractorDocumentsGetAllSuspense({
    contractorUuid: contractorId,
  })
  const documentsToCollect = (documentsData.documents ?? []).filter(
    d => d.requiresSigning && !d.signedAt,
  )
  const hasW9 = documentsToCollect.some(d => d.name === W9_DOCUMENT_NAME)

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

      {documentsToCollect.length > 0 && (
        <Box
          header={
            <BoxHeader
              title={t('documentRequirements.title')}
              description={t('documentRequirements.description', { contractorName })}
            />
          }
        >
          <Flex flexDirection="column" gap={16}>
            {documentsToCollect.map(document => {
              const isW9 = document.name === W9_DOCUMENT_NAME
              const title = isW9
                ? t('documentRequirements.documents.taxpayer_identification_form_w_9.title')
                : (document.title ?? '')
              const description = isW9
                ? t('documentRequirements.documents.taxpayer_identification_form_w_9.description')
                : (document.description ?? '')
              return (
                <DocumentRequirementItem
                  key={document.uuid}
                  title={title}
                  description={description}
                  document={document}
                  downloadLabel={t('documentRequirements.downloadCta')}
                />
              )
            })}
            {hasW9 && <Alert status="info" label={t('documentRequirements.alertLabel')}></Alert>}
          </Flex>
        </Box>
      )}
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

const DocumentRequirementItem = ({
  title,
  description,
  document,
  downloadLabel,
}: {
  title: string
  description: string
  document: Document | undefined
  downloadLabel: string
}) => {
  const { Text, Button } = useComponentContext()
  const documentUuid = document?.uuid
  const { data: pdfData, isLoading: isPdfLoading } = useContractorDocumentsGetPdf(
    { documentUuid: documentUuid ?? '' },
    { enabled: Boolean(documentUuid) },
  )
  const pdfUrl = pdfData?.documentPdf?.documentUrl ?? null

  return (
    <Flex gap={16} justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" gap={4}>
        <Text weight="medium">{title}</Text>
        <Text variant="supporting">{description}</Text>
      </Flex>
      {(isPdfLoading || pdfUrl) && (
        <Button
          variant="secondary"
          isLoading={isPdfLoading}
          onClick={() => {
            if (pdfUrl) window.open(pdfUrl, '_blank', 'noopener,noreferrer')
          }}
        >
          {downloadLabel}
        </Button>
      )}
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
