import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useTranslation } from 'react-i18next'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { usePaymentAmountsEditor } from '../shared/usePaymentAmountsEditor'
import { SetPaymentAmounts } from '../shared/SetPaymentAmounts'
import { useHistoricalPaymentAmountsDictionary } from './useFormDictionary'
import { Flex, FlexItem } from '@/components/Common'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

const ALLOWED_PAYMENT_METHODS: ContractorPaymentMethod[] = ['Historical Payment']

/**
 * Props for {@link HistoricalPaymentAmounts}.
 *
 * @alpha
 */
export interface HistoricalPaymentAmountsProps extends BaseComponentInterface<'Contractor.Payments.HistoricalPaymentAmounts'> {
  /** UUID of the company recording the historical payment. */
  companyId: string
  /** UUIDs of the contractors selected on the previous step. */
  contractorIds: string[]
  /** The check date selected on the previous step, as a `YYYY-MM-DD` string. */
  checkDate: string
}

/**
 * Second step of the historical contractor payment flow: enter hours, wages, bonuses, and
 * reimbursements for the contractors selected on the previous step.
 *
 * @remarks
 * Every contractor payment is fixed to the `Historical Payment` payment method — there is no
 * funds movement, so no payment method choice or debit information is shown. Continue is
 * disabled until at least one contractor has a payment total greater than zero.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/amountsSubmitted` | The user entered amounts and clicked Continue. | `{ checkDate: string, contractorPayments: ContractorPayments[] }` |
 *
 * @param props - See {@link HistoricalPaymentAmountsProps}.
 * @returns The rendered payment-amounts entry screen.
 * @alpha
 */
export function HistoricalPaymentAmounts(props: HistoricalPaymentAmountsProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.HistoricalPaymentAmounts">
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({
  companyId,
  contractorIds,
  checkDate,
  dictionary,
  onEvent,
}: HistoricalPaymentAmountsProps) {
  useI18n('Contractor.Payments.HistoricalPaymentAmounts')
  useComponentDictionary('Contractor.Payments.HistoricalPaymentAmounts', dictionary)
  const { t } = useTranslation('Contractor.Payments.HistoricalPaymentAmounts')
  const { Heading, Text, Button } = useComponentContext()
  const paymentAmountsDictionary = useHistoricalPaymentAmountsDictionary()

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(contractor =>
    contractorIds.includes(contractor.uuid),
  )

  const { virtualContractorPayments, totals, editModal } = usePaymentAmountsEditor({
    contractors,
    allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
  })

  const canContinue = totals.total > 0

  const handleContinue = () => {
    if (!canContinue) return

    const contractorPayments = virtualContractorPayments
      .filter(payment => payment.isTouched)
      .map(({ isTouched: _isTouched, ...rest }) => rest)

    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_AMOUNTS_SUBMITTED, {
      checkDate,
      contractorPayments,
    })
  }

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Heading as="h2">{t('heading')}</Heading>
          <Text variant="supporting">{t('subtitle')}</Text>
        </Flex>
        <FlexItem>
          <Button onClick={handleContinue} variant="primary" isDisabled={!canContinue}>
            {t('continueButton')}
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
