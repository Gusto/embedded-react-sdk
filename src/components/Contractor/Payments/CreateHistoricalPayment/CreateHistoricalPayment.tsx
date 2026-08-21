import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentGroupsPreviewMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsPreview'
import { useContractorPaymentGroupsCreateMutation } from '@gusto/embedded-api/react-query/contractorPaymentGroupsCreate'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  usePaymentAmountsEditor,
  type VirtualContractorPayment,
} from '../shared/usePaymentAmountsEditor'
import { SetPaymentAmounts } from '../shared/SetPaymentAmounts'
import { PaymentSummaryBlock } from '../shared/PaymentSummaryBlock'
import { getHistoricalPaymentCheckDateBounds } from '../shared/historicalPaymentDateBounds'
import {
  useCreateHistoricalPaymentDictionary,
  useCreateHistoricalPaymentReviewDictionary,
} from './useFormDictionary'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { ActionsLayout, Flex, FlexItem } from '@/components/Common'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { componentEvents } from '@/shared/constants'
import { SelectContractors } from '@/components/Contractor/shared/SelectContractors/SelectContractors'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

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
 * move money — by picking a paid date and the contractors being paid, entering hours, wages,
 * bonuses, and reimbursements for them, then reviewing and submitting.
 *
 * @remarks
 * Every contractor payment is fixed to the `Historical Payment` payment method, so there is no
 * payment method choice or debit information to review.
 * Continue on the contractor-selection step is disabled until the paid date is valid and at least
 * one contractor is selected. Continue on the amounts step is disabled until at least one selected
 * contractor has a payment total greater than zero, and swaps the amounts grid for an in-place
 * review (mirroring `CreatePayment`'s preview step); Back returns to the grid without losing
 * entered amounts, and Submit creates the contractor payment group. Once creation succeeds, the
 * Back and Submit buttons are replaced with a success message, since the creation token has been
 * consumed and the host is expected to navigate away (e.g. to `HistoricalPaymentSummary`).
 * The amounts step also has its own Back button, returning to contractor selection without losing
 * the selected paid date, contractors, or any amounts already entered.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/edit` | The edit modal was opened for a contractor. | — |
 * | `contractor/historicalPayments/update` | A contractor's payment values were updated locally. | The updated form values (hours, wage, bonus, reimbursement, payment method, etc.). |
 * | `contractor/historicalPayments/preview` | The preview API call succeeded. | The contractor payment group preview response. |
 * | `contractor/historicalPayments/backToEdit` | The user returned from preview to continue editing. | — |
 * | `contractor/historicalPayments/created` | The payment group was successfully created. | The created contractor payment group response. |
 *
 * @param props - See {@link CreateHistoricalPaymentProps}.
 * @returns The rendered contractor-selection screen, the payment-amounts entry screen, or its
 * in-place review.
 * @alpha
 */
export function CreateHistoricalPayment(props: CreateHistoricalPaymentProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.CreateHistoricalPayment">
      <Root {...props} />
    </BaseComponent>
  )
}

interface ContractorSelection {
  contractorIds: string[]
  checkDate: string
}

function Root({ companyId, dictionary, onEvent }: CreateHistoricalPaymentProps) {
  useUnstableFeature('historicalPayments', { throwIfDisabled: true })
  useI18n('Contractor.Payments.CreateHistoricalPayment')
  useComponentDictionary('Contractor.Payments.CreateHistoricalPayment', dictionary)
  const { t } = useTranslation('Contractor.Payments.CreateHistoricalPayment')
  const { Heading, Text, Button, DatePicker } = useComponentContext()

  const { minDate, maxDate } = useMemo(() => getHistoricalPaymentCheckDateBounds(), [])
  const [checkDate, setCheckDate] = useState<Date | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selection, setSelection] = useState<ContractorSelection | null>(null)
  const [savedContractorPayments, setSavedContractorPayments] = useState<
    VirtualContractorPayment[] | undefined
  >(undefined)

  let dateError: string | null = null
  if (checkDate !== null && checkDate > maxDate) {
    dateError = t('select.dateInFutureError')
  } else if (checkDate !== null && checkDate < minDate) {
    dateError = t('select.dateTooEarlyError', {
      year: checkDate.getFullYear(),
      allowedYear: minDate.getFullYear(),
    })
  }

  const canContinue = selectedIds.length > 0 && checkDate !== null && dateError === null

  const handleContinue = () => {
    if (!canContinue) return
    const checkDateString = formatDateToStringDate(checkDate)
    if (!checkDateString) return
    setSelection({ contractorIds: selectedIds, checkDate: checkDateString })
  }

  if (!selection) {
    return (
      <Flex flexDirection="column" gap={32}>
        <Flex flexDirection="column" gap={4}>
          <Heading as="h2">{t('select.heading')}</Heading>
          <Text variant="supporting">{t('select.subtitle')}</Text>
        </Flex>

        <DatePicker
          label={t('select.dateLabel')}
          isRequired
          value={checkDate}
          onChange={setCheckDate}
          minDate={minDate}
          maxDate={maxDate}
          isInvalid={dateError !== null}
          errorMessage={dateError ?? undefined}
        />

        <SelectContractors
          companyId={companyId}
          onSelectionChange={setSelectedIds}
          initialSelectedIds={selectedIds}
        />

        <ActionsLayout>
          <Button onClick={handleContinue} variant="primary" isDisabled={!canContinue}>
            {t('select.continueButton')}
          </Button>
        </ActionsLayout>
      </Flex>
    )
  }

  return (
    <AmountsAndReview
      companyId={companyId}
      contractorIds={selection.contractorIds}
      checkDate={selection.checkDate}
      onEvent={onEvent}
      preservedContractorPayments={savedContractorPayments}
      onBack={payments => {
        setSavedContractorPayments(payments)
        setSelection(null)
      }}
    />
  )
}

interface AmountsAndReviewProps {
  companyId: string
  contractorIds: string[]
  checkDate: string
  onEvent: CreateHistoricalPaymentProps['onEvent']
  preservedContractorPayments?: VirtualContractorPayment[]
  onBack: (payments: VirtualContractorPayment[]) => void
}

function AmountsAndReview({
  companyId,
  contractorIds,
  checkDate,
  onEvent,
  preservedContractorPayments,
  onBack,
}: AmountsAndReviewProps) {
  const { t } = useTranslation('Contractor.Payments.CreateHistoricalPayment')
  const { Heading, Text, Button, Alert } = useComponentContext()
  const { baseSubmitHandler } = useBase()
  const { formatLongWithYear } = useDateFormatter()
  const paymentAmountsDictionary = useCreateHistoricalPaymentDictionary()
  const reviewDictionary = useCreateHistoricalPaymentReviewDictionary()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors ?? []).filter(contractor =>
    contractorIds.includes(contractor.uuid),
  )

  const { virtualContractorPayments, totals, editModal } = usePaymentAmountsEditor({
    contractors,
    allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
    preservedContractorPayments,
    onEditOpen: () => {
      onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EDIT)
    },
    onEditSave: data => {
      onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_UPDATE, data)
    },
  })

  const canContinue = totals.total > 0

  const { mutateAsync: previewContractorPaymentGroup, isPending: isPreviewing } =
    useContractorPaymentGroupsPreviewMutation()
  const { mutateAsync: createContractorPaymentGroup, isPending: isCreating } =
    useContractorPaymentGroupsCreateMutation()

  const [previewData, setPreviewData] = useState<ContractorPaymentGroupPreview | null>(null)
  const [isCreated, setIsCreated] = useState(false)

  const touchedContractorPayments = () =>
    virtualContractorPayments
      .filter(payment => payment.isTouched)
      .map(({ isTouched: _isTouched, ...rest }) => rest)

  const handleContinue = async () => {
    if (!canContinue) return

    await baseSubmitHandler(null, async () => {
      const response = await previewContractorPaymentGroup({
        request: {
          companyId,
          requestBody: {
            checkDate: new RFCDate(checkDate),
            contractorPayments: touchedContractorPayments(),
          },
        },
      })
      setPreviewData(response.contractorPaymentGroupPreview || null)
      onEvent(
        componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_PREVIEW,
        response.contractorPaymentGroupPreview,
      )
    })
  }

  const handleBackToEdit = () => {
    setPreviewData(null)
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_BACK_TO_EDIT)
  }

  const handleSubmit = async () => {
    const creationToken = previewData?.creationToken
    if (!creationToken || isCreated) return

    await baseSubmitHandler(null, async () => {
      const response = await createContractorPaymentGroup({
        request: {
          companyId,
          requestBody: {
            checkDate: new RFCDate(checkDate),
            creationToken,
            contractorPayments: touchedContractorPayments(),
          },
        },
      })

      if (!response.contractorPaymentGroup) return

      setIsCreated(true)
      onEvent(
        componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
        response.contractorPaymentGroup,
      )
    })
  }

  if (previewData) {
    return (
      <Flex flexDirection="column" gap={32}>
        {!isCreated && <BackButton onClick={handleBackToEdit} />}

        <Flex justifyContent="space-between" alignItems="flex-start" gap={16}>
          <Flex flexDirection="column" gap={4}>
            <Heading as="h2">{t('review.title')}</Heading>
            <Text variant="supporting">
              {t('review.subtitle', {
                checkDate: formatLongWithYear(previewData.checkDate ?? ''),
              })}
            </Text>
          </Flex>
          {!isCreated && (
            <Button onClick={handleSubmit} variant="primary" isLoading={isCreating}>
              {t('review.submitButton')}
            </Button>
          )}
        </Flex>

        {isCreated && (
          <Alert status="success" label={t('review.successTitle')}>
            <Text>{t('review.successMessage')}</Text>
          </Alert>
        )}

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
      <BackButton
        onClick={() => {
          onBack(virtualContractorPayments)
        }}
      />

      <Flex justifyContent="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Heading as="h2">{t('amounts.heading')}</Heading>
          <Text variant="supporting">{t('amounts.subtitle')}</Text>
        </Flex>
        <FlexItem>
          <Button
            onClick={handleContinue}
            variant="primary"
            isDisabled={!canContinue}
            isLoading={isPreviewing}
          >
            {t('amounts.continueButton')}
          </Button>
        </FlexItem>
      </Flex>

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

function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('Contractor.Payments.CreateHistoricalPayment')
  const { Button } = useComponentContext()

  return (
    <Button variant="secondary" icon={<CaretLeftIcon aria-hidden="true" />} onClick={onClick}>
      {t('backButton')}
    </Button>
  )
}
