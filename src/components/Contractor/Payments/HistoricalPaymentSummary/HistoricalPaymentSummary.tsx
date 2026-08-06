import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { PaymentSummaryBlock } from '../shared/PaymentSummaryBlock'
import { useHistoricalPaymentSummaryDictionary } from './useFormDictionary'
import { Flex, FlexItem, Loading } from '@/components/Common'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link HistoricalPaymentSummary}.
 *
 * @alpha
 */
export interface HistoricalPaymentSummaryProps extends BaseComponentInterface<'Contractor.Payments.HistoricalPaymentSummary'> {
  /** UUID of the company recording the historical payment. */
  companyId: string
  /** The check date selected on the first step, as a `YYYY-MM-DD` string. */
  checkDate: string
  /** The contractor payments entered on the previous step. */
  contractorPayments: ContractorPayments[]
}

/**
 * Final step of the historical contractor payment flow: review the entered amounts and submit.
 *
 * @remarks
 * Fixed to the `Historical Payment` payment method, so there is no debit account, debit date, or
 * wire-transfer information to review — this records that a payment already happened, it does not
 * move money.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/created` | The historical payment was successfully recorded. | The created contractor payment group. |
 * | `contractor/historicalPayments/exit` | The user clicked Done after the payment was recorded. | — |
 *
 * @param props - See {@link HistoricalPaymentSummaryProps}.
 * @returns The rendered review-and-submit screen.
 * @alpha
 */
export function HistoricalPaymentSummary(props: HistoricalPaymentSummaryProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.HistoricalPaymentSummary">
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({
  companyId,
  checkDate,
  contractorPayments,
  dictionary,
  onEvent,
}: HistoricalPaymentSummaryProps) {
  useI18n('Contractor.Payments.HistoricalPaymentSummary')
  useComponentDictionary('Contractor.Payments.HistoricalPaymentSummary', dictionary)
  const { t } = useTranslation('Contractor.Payments.HistoricalPaymentSummary')
  const { Heading, Text, Button, Alert } = useComponentContext()
  const { baseSubmitHandler } = useBase()
  const { formatLongWithYear } = useDateFormatter()
  const paymentSummaryDictionary = useHistoricalPaymentSummaryDictionary()

  const contractorIds = useMemo(
    () => contractorPayments.map(payment => payment.contractorUuid),
    [contractorPayments],
  )
  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(contractor =>
    contractorIds.includes(contractor.uuid),
  )

  const { mutateAsync: previewPaymentGroup } = useContractorPaymentGroupsPreviewMutation()
  const { mutateAsync: createPaymentGroup, isPending: isCreating } =
    useContractorPaymentGroupsCreateMutation()

  const [preview, setPreview] = useState<ContractorPaymentGroupPreview | null>(null)
  const [createdGroup, setCreatedGroup] = useState<ContractorPaymentGroup | null>(null)
  const hasRequestedPreviewRef = useRef(false)

  useEffect(() => {
    if (hasRequestedPreviewRef.current) return
    hasRequestedPreviewRef.current = true

    void baseSubmitHandler(null, async () => {
      const response = await previewPaymentGroup({
        request: {
          companyId,
          requestBody: {
            checkDate: new RFCDate(checkDate),
            contractorPayments,
          },
        },
      })
      setPreview(response.contractorPaymentGroupPreview || null)
    })
  }, [baseSubmitHandler, companyId, checkDate, contractorPayments, previewPaymentGroup])

  const handleSubmit = async () => {
    const creationToken = preview?.creationToken
    if (!creationToken) return

    await baseSubmitHandler(null, async () => {
      const response = await createPaymentGroup({
        request: {
          companyId,
          requestBody: {
            checkDate: new RFCDate(checkDate),
            creationToken,
            contractorPayments,
          },
        },
      })
      const created = response.contractorPaymentGroup || {}
      setCreatedGroup(created)
      onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED, created)
    })
  }

  const handleDone = () => {
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT)
  }

  if (createdGroup) {
    return (
      <Flex flexDirection="column" gap={24}>
        <Alert status="success" label={t('successTitle')}>
          <Text>
            {t('successMessage', { count: createdGroup.contractorPayments?.length ?? 0 })}
          </Text>
        </Alert>

        <Flex justifyContent="space-between" alignItems="flex-start">
          <Flex flexDirection="column" gap={2}>
            <Heading as="h2">{t('createdTitle')}</Heading>
            <Text variant="supporting">
              {t('createdSubtitle', { checkDate: formatLongWithYear(checkDate) })}
            </Text>
          </Flex>
          <FlexItem>
            <Button onClick={handleDone} variant="primary">
              {t('doneCta')}
            </Button>
          </FlexItem>
        </Flex>

        <PaymentSummaryBlock
          contractorPaymentGroup={createdGroup}
          contractors={contractors}
          showDebitColumns={false}
          dictionary={paymentSummaryDictionary}
        />
      </Flex>
    )
  }

  if (!preview) {
    return <Loading />
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('reviewTitle')}</Heading>
          <Text variant="supporting">
            {t('reviewSubtitle', { checkDate: formatLongWithYear(checkDate) })}
          </Text>
        </Flex>
        <FlexItem>
          <Button onClick={handleSubmit} variant="primary" isLoading={isCreating}>
            {t('submitCta')}
          </Button>
        </FlexItem>
      </Flex>

      <PaymentSummaryBlock
        contractorPaymentGroup={preview}
        contractors={contractors}
        showDebitColumns={false}
        dictionary={paymentSummaryDictionary}
      />
    </Flex>
  )
}
