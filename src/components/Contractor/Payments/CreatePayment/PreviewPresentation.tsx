import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import type { ContractorPaymentForGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentforgrouppreview'
import { useMemo } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { getContractorDisplayName } from './helpers'
import { FastAchSubmissionBlockerBanner } from './FastAchSubmissionBlockerBanner'
import { GenericBlocker } from './GenericBlocker'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES } from '@/shared/constants'

const ZERO_HOURS_DISPLAY = '0.000'

interface PreviewPresentationProps {
  contractorPaymentGroup: ContractorPaymentGroupPreview
  contractors: Contractor[]
  onBackToEdit: () => void
  onSubmit: () => void
  isLoading: boolean
  bankAccount?: CompanyBankAccount
  selectedUnblockOptions?: Record<string, string>
  onUnblockOptionChange?: (blockerType: string, value: string) => void
}

export const PreviewPresentation = ({
  contractorPaymentGroup,
  contractors,
  onBackToEdit,
  onSubmit,
  isLoading,
  bankAccount,
  selectedUnblockOptions = {},
  onUnblockOptionChange,
}: PreviewPresentationProps) => {
  const { Button, Text, Heading, Alert } = useComponentContext()
  useI18n('Contractor.Payments.CreatePayment')
  const { t } = useTranslation('Contractor.Payments.CreatePayment', {
    keyPrefix: 'previewPresentation',
  })
  const currencyFormatter = useNumberFormatter()

  const formatWageType = (contractor: ContractorPaymentForGroupPreview) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `${t('wageTypes.hourly')} ${currencyFormatter(Number(contractor.hourlyRate || '0'))}${t('perHour')}`
    }
    return contractor.wageType
  }

  const totals = useMemo(
    () =>
      contractorPaymentGroup.contractorPayments?.reduce(
        (acc, contractor) => {
          acc.wageAmount += Number(contractor.wage || '0')
          acc.bonusAmount += Number(contractor.bonus || '0')
          acc.reimbursementAmount += Number(contractor.reimbursement || '0')
          acc.totalAmount += Number(contractor.wageTotal || '0')
          return acc
        },
        { wageAmount: 0, bonusAmount: 0, reimbursementAmount: 0, totalAmount: 0 },
      ),
    [contractorPaymentGroup.contractorPayments],
  )

  const contractorPayments = contractorPaymentGroup.contractorPayments || []

  const submissionBlockers = (contractorPaymentGroup.submissionBlockers || []).filter(
    blocker => blocker.status === 'unresolved',
  )

  const hasUnresolvableBlockers = submissionBlockers.some(
    blocker => !PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES.includes(blocker.blockerType || ''),
  )

  const hasUnselectedBlockers = submissionBlockers.some(
    blocker => !selectedUnblockOptions[blocker.blockerType || ''],
  )

  const isSubmitDisabled =
    isLoading ||
    (submissionBlockers.length > 0 && (hasUnresolvableBlockers || hasUnselectedBlockers))

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="flex-end" gap={16}>
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('reviewAndSubmitTitle')}</Heading>
          <Text variant="supporting">
            {t('reviewSubtitle', { debitDate: contractorPaymentGroup.debitDate })}
          </Text>
        </Flex>
        <Flex justifyContent="flex-end" gap={16}>
          <Button onClick={onBackToEdit} variant="secondary">
            {t('editButton')}
          </Button>
          <Button
            onClick={onSubmit}
            variant="primary"
            isLoading={isLoading}
            isDisabled={isSubmitDisabled}
          >
            {t('submitButton')}
          </Button>
        </Flex>
      </Flex>

      <Alert
        status="info"
        label={t('alerts.submitPaymentsDeadline', {
          checkDate: contractorPaymentGroup.checkDate,
          debitDate: contractorPaymentGroup.debitDate,
        })}
      />

      {submissionBlockers.length > 0 &&
        onUnblockOptionChange &&
        submissionBlockers.map(blocker => {
          const blockerType = blocker.blockerType || ''

          if (PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES.includes(blockerType)) {
            return (
              <FastAchSubmissionBlockerBanner
                key={blockerType}
                blocker={blocker}
                selectedValue={selectedUnblockOptions[blockerType]}
                onUnblockOptionChange={onUnblockOptionChange}
              />
            )
          }

          return <GenericBlocker key={blockerType} blocker={blocker} />
        })}

      {/* Payment Summary */}
      <Heading as="h3">{t('paymentSummaryTitle')}</Heading>
      <DataView
        columns={[
          {
            title: t('summaryTableHeaders.totalAmount'),
            render: () => (
              <Text>{currencyFormatter(Number(contractorPaymentGroup.totals?.amount || '0'))}</Text>
            ),
          },
          {
            title: t('summaryTableHeaders.debitAmount'),
            render: () => (
              <Text>
                {currencyFormatter(Number(contractorPaymentGroup.totals?.debitAmount || '0'))}
              </Text>
            ),
          },
          {
            title: t('summaryTableHeaders.debitAccount'),
            render: () => <Text>{bankAccount?.hiddenAccountNumber ?? t('naDebitAccount')}</Text>,
          },
          {
            title: t('summaryTableHeaders.debitDate'),
            render: () => <Text>{contractorPaymentGroup.debitDate || 'debitDate'}</Text>,
          },
          {
            title: t('summaryTableHeaders.contractorPayDate'),
            render: () => <Text>{contractorPaymentGroup.checkDate || 'contractorPayDate'}</Text>,
          },
        ]}
        data={[contractorPaymentGroup]}
        label="Payment Summary"
      />

      {/* Contractor Payments Table */}
      <DataView
        columns={[
          {
            title: t('contractorTableHeaders.contractor'),
            render: contractorPayment => (
              <Text>
                {getContractorDisplayName(
                  contractors.find(
                    contractor => contractor.uuid === contractorPayment.contractorUuid,
                  ),
                )}
              </Text>
            ),
          },
          {
            title: t('contractorTableHeaders.wageType'),
            render: contractorPayment => <Text>{formatWageType(contractorPayment)}</Text>,
          },
          {
            title: t('contractorTableHeaders.paymentMethod'),
            render: contractorPayment => <Text>{contractorPayment.paymentMethod || 'N/A'}</Text>,
          },
          {
            title: t('contractorTableHeaders.hours'),
            render: contractorPayment => {
              const hours = Number(contractorPayment.hours || '0')
              return (
                <Text>
                  {contractorPayment.wageType === 'Hourly' && hours
                    ? formatHoursDisplay(hours)
                    : ZERO_HOURS_DISPLAY}
                </Text>
              )
            },
          },
          {
            title: t('contractorTableHeaders.wage'),
            render: contractorPayment => (
              <Text>
                {contractorPayment.wageType === 'Fixed' && contractorPayment.wage
                  ? currencyFormatter(Number(contractorPayment.wage || '0'))
                  : currencyFormatter(0)}
              </Text>
            ),
          },
          {
            title: t('contractorTableHeaders.bonus'),
            render: contractorPayment => (
              <Text>{currencyFormatter(Number(contractorPayment.bonus || '0'))}</Text>
            ),
          },
          {
            title: t('contractorTableHeaders.reimbursement'),
            render: contractorPayment => (
              <Text>{currencyFormatter(Number(contractorPayment.reimbursement || '0'))}</Text>
            ),
          },
          {
            title: t('contractorTableHeaders.total'),
            render: contractorPayment => (
              <Text>{currencyFormatter(Number(contractorPayment.wageTotal || '0'))}</Text>
            ),
          },
        ]}
        data={contractorPayments}
        footer={() => ({
          'column-0': <Text weight="bold">{t('totalsLabel')}</Text>,
          'column-4': <Text>{currencyFormatter(totals?.wageAmount ?? 0)}</Text>,
          'column-5': <Text>{currencyFormatter(totals?.bonusAmount ?? 0)}</Text>,
          'column-6': <Text>{currencyFormatter(totals?.reimbursementAmount ?? 0)}</Text>,
          'column-7': <Text>{currencyFormatter(totals?.totalAmount ?? 0)}</Text>,
        })}
        label={t('whatYourCompanyPays')}
      />
    </Flex>
  )
}
