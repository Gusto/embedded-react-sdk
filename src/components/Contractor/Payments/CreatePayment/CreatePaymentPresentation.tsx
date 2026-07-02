import { useTranslation } from 'react-i18next'
import type { Contractor } from '@gusto/embedded-api-v-2026-02-01/models/components/contractor'
import type { ContractorPayments } from '@gusto/embedded-api-v-2026-02-01/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useMemo } from 'react'
import type { InternalAlert } from '../types'
import { getContractorDisplayName } from './helpers'
import type { ApiPayrollBlocker } from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import { PayrollBlockerAlerts } from '@/components/Payroll/PayrollBlocker/components/PayrollBlockerAlerts'
import { DataView, Flex, FlexItem, EmptyData } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import {
  formatDateToStringDate,
  normalizeDateToLocal,
  normalizeToDate,
} from '@/helpers/dateFormatting'

const ZERO_HOURS_DISPLAY = '0.000'

interface ContractorPaymentCreatePaymentPresentationProps {
  contractors: Contractor[]
  contractorPayments: (ContractorPayments & { isTouched?: boolean })[]
  paymentDate: string
  onPaymentDateChange: (date: string) => void
  onSaveAndContinue: () => void
  onEditContractor: (contractorUuid: string) => void
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
  onEditContractor,
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
  const currencyFormatter = useNumberFormatter('currency')

  const formatWageType = (contractor?: Contractor) => {
    if (!contractor) return ''
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return ` ${currencyFormatter(Number(contractor.hourlyRate || '0'))}${t('perHour')}`
    }
    return contractor.wageType
  }

  const tableData = useMemo(
    () =>
      contractorPayments.map(payment => {
        return {
          ...payment,
          contractorDetails: contractors.find(
            contractor => contractor.uuid === payment.contractorUuid,
          ),
        }
      }),
    [contractorPayments, contractors],
  )

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

      <Flex flexDirection="column" gap={16}>
        <Heading as="h3">{t('hoursAndPaymentsLabel')}</Heading>
        <DataView
          columns={[
            {
              title: t('contractorTableHeaders.contractor'),
              render: paymentData => getContractorDisplayName(paymentData.contractorDetails),
            },
            {
              title: t('contractorTableHeaders.wageType'),
              render: paymentData => formatWageType(paymentData.contractorDetails),
            },
            {
              title: t('contractorTableHeaders.paymentMethod'),
              render: paymentData => paymentData.paymentMethod || t('na'),
            },
            {
              title: t('contractorTableHeaders.hours'),
              justify: 'end',
              render: paymentData => {
                if (paymentData.contractorDetails?.wageType === 'Fixed') return t('na')
                const hours = Number(paymentData.hours || '0')
                return hours ? formatHoursDisplay(hours) : ZERO_HOURS_DISPLAY
              },
            },
            {
              title: t('contractorTableHeaders.wage'),
              justify: 'end',
              render: paymentData => {
                if (paymentData.contractorDetails?.wageType === 'Hourly') return t('na')
                return currencyFormatter(Number(paymentData.wage || '0'))
              },
            },
            {
              title: t('contractorTableHeaders.bonus'),
              justify: 'end',
              render: paymentData => currencyFormatter(Number(paymentData.bonus || '0')),
            },
            {
              title: t('contractorTableHeaders.reimbursement'),
              justify: 'end',
              render: paymentData => currencyFormatter(Number(paymentData.reimbursement || '0')),
            },
            {
              title: t('contractorTableHeaders.total'),
              justify: 'end',
              render: ({ bonus, reimbursement, wage, hours, contractorDetails }) => {
                const totalAmount =
                  Number(bonus || '0') +
                  Number(reimbursement || '0') +
                  Number(wage || '0') +
                  (contractorDetails?.wageType === 'Hourly' && hours
                    ? Number(hours || '0') * Number(contractorDetails.hourlyRate || '0')
                    : 0)
                return currencyFormatter(totalAmount)
              },
            },
          ]}
          data={tableData}
          footer={
            tableData.length > 0
              ? () => ({
                  'column-0': t('totalsLabel'),
                  'column-4': currencyFormatter(totals.wage),
                  'column-5': currencyFormatter(totals.bonus),
                  'column-6': currencyFormatter(totals.reimbursement),
                  'column-7': currencyFormatter(totals.total),
                })
              : undefined
          }
          label={t('hoursAndPaymentsLabel')}
          itemMenu={paymentData => (
            <HamburgerMenu
              items={[
                {
                  label: t('editContractor'),
                  onClick: () => {
                    onEditContractor(paymentData.contractorUuid!)
                  },
                },
              ]}
              triggerLabel={t('editContractor')}
            />
          )}
          emptyState={() => (
            <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
          )}
        />
      </Flex>
    </Flex>
  )
}
