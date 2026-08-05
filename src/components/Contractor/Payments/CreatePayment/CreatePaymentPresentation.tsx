import { useTranslation } from 'react-i18next'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type {
  PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { InternalAlert } from '../types'
import { SetPaymentAmounts, type SetPaymentAmountsDictionary } from '../shared/SetPaymentAmounts'
import type { UsePaymentAmountsEditorReturn } from '../shared/usePaymentAmountsEditor'
import type { ApiPayrollBlocker } from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import { PayrollBlockerAlerts } from '@/components/Payroll/PayrollBlocker/components/PayrollBlockerAlerts'
import { Flex, FlexItem } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import {
  formatDateToStringDate,
  normalizeDateToLocal,
  normalizeToDate,
} from '@/helpers/dateFormatting'

interface ContractorPaymentCreatePaymentPresentationProps {
  contractors: Contractor[]
  contractorPayments: (ContractorPayments & { isTouched?: boolean })[]
  paymentDate: string
  onPaymentDateChange: (date: string) => void
  onSaveAndContinue: () => void
  editModal: UsePaymentAmountsEditorReturn['editModal']
  allowedPaymentMethods: ContractorPaymentMethod[]
  paymentAmountsDictionary: SetPaymentAmountsDictionary
  totals: {
    wage: number
    bonus: number
    reimbursement: number
    total: number
  }
  alerts: Record<string, InternalAlert>
  payrollBlockers?: ApiPayrollBlocker[]
  onViewBlockers?: () => void
  isLoading: boolean
  paymentSpeedDays: number
}

/** @internal */
export const CreatePaymentPresentation = ({
  contractors,
  paymentDate,
  contractorPayments,
  onPaymentDateChange,
  onSaveAndContinue,
  editModal,
  allowedPaymentMethods,
  paymentAmountsDictionary,
  totals,
  alerts,
  payrollBlockers = [],
  onViewBlockers,
  isLoading,
  paymentSpeedDays,
}: ContractorPaymentCreatePaymentPresentationProps) => {
  const { Button, Text, Heading, DatePicker, Alert } = useComponentContext()
  useI18n('Contractor.Payments.CreatePayment')
  const { t } = useTranslation('Contractor.Payments.CreatePayment')

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Heading as="h2">{t('title')}</Heading>
          <Text variant="supporting">
            {t('paymentSpeedNotice', {
              count: paymentSpeedDays,
            })}
          </Text>
        </Flex>
        <FlexItem>
          <Button onClick={onSaveAndContinue} variant="primary" isLoading={isLoading}>
            {t('continueCta')}
          </Button>
        </FlexItem>
      </Flex>

      {payrollBlockers.length > 0 && (
        <PayrollBlockerAlerts blockers={payrollBlockers} onViewBlockersClick={onViewBlockers} />
      )}

      {Object.values(alerts).map(alert => (
        <Alert
          key={alert.title}
          label={alert.title}
          onDismiss={alert.onDismiss}
          status={alert.type}
        >
          {alert.content ?? null}
        </Alert>
      ))}

      <Flex flexDirection="column" gap={8}>
        <DatePicker
          value={paymentDate ? normalizeToDate(paymentDate) : null}
          onChange={date => {
            const normalized = normalizeDateToLocal(date)
            onPaymentDateChange(normalized ? (formatDateToStringDate(normalized) ?? '') : '')
          }}
          label={t('dateLabel')}
          isRequired
        />
      </Flex>

      <SetPaymentAmounts
        contractors={contractors}
        contractorPayments={contractorPayments}
        totals={totals}
        allowedPaymentMethods={allowedPaymentMethods}
        editModal={editModal}
        dictionary={paymentAmountsDictionary}
      />
    </Flex>
  )
}
