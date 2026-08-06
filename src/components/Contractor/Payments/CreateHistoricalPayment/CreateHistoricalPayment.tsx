import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePaymentAmountsEditor } from '../shared/usePaymentAmountsEditor'
import { SetPaymentAmounts } from '../shared/SetPaymentAmounts'
import { PaymentSummaryBlock } from '../shared/PaymentSummaryBlock'
import { getHistoricalPaymentCheckDateBounds } from '../shared/historicalPaymentDateBounds'
import {
  useCreateHistoricalPaymentDictionary,
  useCreateHistoricalPaymentReviewDictionary,
} from './useFormDictionary'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { Flex, FlexItem } from '@/components/Common'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'

const ALLOWED_PAYMENT_METHODS: ContractorPaymentMethod[] = ['Historical Payment']

/**
 * Props for {@link CreateHistoricalPayment}.
 *
 * @alpha
 */
export interface CreateHistoricalPaymentProps extends BaseComponentInterface<'Contractor.Payments.CreateHistoricalPayment'> {
  /** UUID of the company recording the historical payment. */
  companyId: string
}

/**
 * Records a historical contractor payment — one that already happened outside Gusto and does not
 * move money — by picking a paid date and entering hours, wages, bonuses, and reimbursements for
 * whichever contractors were paid, then reviewing and submitting.
 *
 * @remarks
 * Every eligible contractor is listed; entering an amount for a contractor is what includes them
 * — there is no separate selection step. Every contractor payment is fixed to the
 * `Historical Payment` payment method, so there is no payment method choice or debit information
 * to review.
 * Continue is disabled until the paid date is valid and at least one contractor has a payment
 * total greater than zero. Clicking Continue swaps the amounts grid for an in-place review
 * (mirroring `CreatePayment`'s preview step); Edit returns to the grid without losing entered
 * amounts, and Submit creates the contractor payment group.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/created` | The payment group was successfully created. | `{ paymentGroupId: string }` |
 *
 * @param props - See {@link CreateHistoricalPaymentProps}.
 * @returns The rendered payment-amounts entry screen, or its in-place review.
 * @alpha
 */
export function CreateHistoricalPayment(props: CreateHistoricalPaymentProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.CreateHistoricalPayment">
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, dictionary, onEvent }: CreateHistoricalPaymentProps) {
  useI18n('Contractor.Payments.CreateHistoricalPayment')
  useComponentDictionary('Contractor.Payments.CreateHistoricalPayment', dictionary)
  const { t } = useTranslation('Contractor.Payments.CreateHistoricalPayment')
  const { Heading, Text, Button, DatePicker } = useComponentContext()
  const { baseSubmitHandler } = useBase()
  const { formatLongWithYear } = useDateFormatter()
  const paymentAmountsDictionary = useCreateHistoricalPaymentDictionary()
  const reviewDictionary = useCreateHistoricalPaymentReviewDictionary()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(
    contractor =>
      contractor.isActive &&
      contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED,
  )

  const { minDate, maxDate } = useMemo(() => getHistoricalPaymentCheckDateBounds(), [])
  const [checkDate, setCheckDate] = useState<Date | null>(null)

  let dateError: string | null = null
  if (checkDate !== null && checkDate > maxDate) {
    dateError = t('dateInFutureError')
  } else if (checkDate !== null && checkDate < minDate) {
    dateError = t('dateTooEarlyError', {
      year: checkDate.getFullYear(),
      allowedYear: minDate.getFullYear(),
    })
  }

  const { virtualContractorPayments, totals, editModal } = usePaymentAmountsEditor({
    contractors,
    allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
  })

  const canContinue = totals.total > 0 && checkDate !== null && dateError === null

  const { mutateAsync: previewContractorPaymentGroup, isPending: isPreviewing } =
    useContractorPaymentGroupsPreviewMutation()
  const { mutateAsync: createContractorPaymentGroup, isPending: isCreating } =
    useContractorPaymentGroupsCreateMutation()

  const [previewData, setPreviewData] = useState<ContractorPaymentGroupPreview | null>(null)

  const touchedContractorPayments = () =>
    virtualContractorPayments
      .filter(payment => payment.isTouched)
      .map(({ isTouched: _isTouched, ...rest }) => rest)

  const handleContinue = async () => {
    if (!canContinue) return
    const checkDateString = formatDateToStringDate(checkDate)
    if (!checkDateString) return

    await baseSubmitHandler(null, async () => {
      const response = await previewContractorPaymentGroup({
        request: {
          companyId,
          requestBody: {
            checkDate: new RFCDate(checkDateString),
            contractorPayments: touchedContractorPayments(),
          },
        },
      })
      setPreviewData(response.contractorPaymentGroupPreview || null)
    })
  }

  const handleBackToEdit = () => {
    setPreviewData(null)
  }

  const handleSubmit = async () => {
    const creationToken = previewData?.creationToken
    const checkDateString = checkDate !== null ? formatDateToStringDate(checkDate) : null
    if (!creationToken || !checkDateString) return

    await baseSubmitHandler(null, async () => {
      const response = await createContractorPaymentGroup({
        request: {
          companyId,
          requestBody: {
            checkDate: new RFCDate(checkDateString),
            creationToken,
            contractorPayments: touchedContractorPayments(),
          },
        },
      })

      const paymentGroupId = response.contractorPaymentGroup?.uuid
      if (!paymentGroupId) return

      onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED, { paymentGroupId })
    })
  }

  if (previewData) {
    return (
      <Flex flexDirection="column" gap={32}>
        <Flex justifyContent="space-between" alignItems="flex-start" gap={16}>
          <Flex flexDirection="column" gap={4}>
            <Heading as="h2">{t('review.title')}</Heading>
            <Text variant="supporting">
              {t('review.subtitle', {
                checkDate: formatLongWithYear(previewData.checkDate ?? ''),
              })}
            </Text>
          </Flex>
          <FlexItem>
            <Flex gap={16}>
              <Button onClick={handleBackToEdit} variant="secondary">
                {t('review.editButton')}
              </Button>
              <Button onClick={handleSubmit} variant="primary" isLoading={isCreating}>
                {t('review.submitButton')}
              </Button>
            </Flex>
          </FlexItem>
        </Flex>

        <PaymentSummaryBlock
          contractorPaymentGroup={previewData}
          contractors={contractors}
          showDebitColumns={false}
          dictionary={reviewDictionary}
        />
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Heading as="h2">{t('heading')}</Heading>
          <Text variant="supporting">{t('subtitle')}</Text>
        </Flex>
        <FlexItem>
          <Button
            onClick={handleContinue}
            variant="primary"
            isDisabled={!canContinue}
            isLoading={isPreviewing}
          >
            {t('continueButton')}
          </Button>
        </FlexItem>
      </Flex>

      <DatePicker
        label={t('dateLabel')}
        isRequired
        value={checkDate}
        onChange={setCheckDate}
        minDate={minDate}
        maxDate={maxDate}
        isInvalid={dateError !== null}
        errorMessage={dateError ?? undefined}
      />

      <SetPaymentAmounts
        contractors={contractors}
        contractorPayments={virtualContractorPayments}
        totals={totals}
        allowedPaymentMethods={ALLOWED_PAYMENT_METHODS}
        editModal={editModal}
        dictionary={paymentAmountsDictionary}
      />
    </Flex>
  )
}
