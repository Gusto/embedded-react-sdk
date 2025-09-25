import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import type {
  PayrollReceipt,
  Taxes as TaxBreakdownItem,
  PayrollReceiptEmployeeCompensations as EmployeeBreakdownItem,
} from '@gusto/embedded-api/models/components/payrollreceipt'
import styles from './PayrollReceiptsPresentation.module.scss'
import { DataView, DataTable, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import ReceiptCheck from '@/assets/icons/receipt-check.svg?react'

interface PayrollReceiptsPresentationProps {
  receiptData: PayrollReceipt
}

export const PayrollReceiptsPresentation = ({ receiptData }: PayrollReceiptsPresentationProps) => {
  const { Heading, Text } = useComponentContext()
  useI18n('Payroll.PayrollReceipts')
  const { t } = useTranslation('Payroll.PayrollReceipts')

  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isMobile = !breakpoints.includes('small')

  // Helper to get employee full name
  const getEmployeeFullName = (emp: EmployeeBreakdownItem) =>
    `${emp.employeeFirstName || ''} ${emp.employeeLastName || ''}`.trim()

  const getTotalChildSupport = () =>
    (receiptData.employeeCompensations || []).reduce(
      (sum, emp) => sum + parseFloat(emp.childSupportGarnishment || '0'),
      0,
    )

  const getTotalReimbursements = () =>
    (receiptData.employeeCompensations || []).reduce(
      (sum, emp) => sum + parseFloat(emp.totalReimbursement || '0'),
      0,
    )

  const getTotalNetPay = () =>
    (receiptData.employeeCompensations || []).reduce(
      (sum, emp) => sum + parseFloat(emp.netPay || '0'),
      0,
    )

  const getTotalTaxes = () =>
    (receiptData.employeeCompensations || []).reduce(
      (sum, emp) => sum + parseFloat(emp.totalTax || '0'),
      0,
    )

  const breakdownData = [
    {
      label: t('breakdown.directDeposits'),
      amount: parseFloat(receiptData.totals?.netPayDebit || '0'),
    },
    {
      label: t('breakdown.reimbursements'),
      amount: parseFloat(receiptData.totals?.reimbursementDebit || '0'),
    },
    {
      label: t('breakdown.garnishments'),
      amount: parseFloat(receiptData.totals?.childSupportDebit || '0'),
    },
    { label: t('breakdown.taxes'), amount: parseFloat(receiptData.totals?.taxDebit || '0') },
  ]

  const receiptDetailsConfig = [
    {
      label: t('receipt.receiptId'),
      value: receiptData.payrollUuid || '',
    },
    {
      label: t('receipt.from'),
      value: receiptData.nameOfSender || '',
    },
    {
      label: t('receipt.to'),
      value: receiptData.nameOfRecipient || 'Payroll Recipients',
    },
    {
      label: t('receipt.debitDate'),
      value: receiptData.debitDate || '',
    },
  ]

  const renderReceiptHeader = () => (
    <div className={classNames(styles.receiptHeader, isMobile && styles.receiptHeaderMobile)}>
      <Flex flexDirection="column" gap={24}>
        <Flex flexDirection="column" alignItems="center" gap={16}>
          <div className={styles.receiptIcon}>
            <ReceiptCheck className={styles.checkmarkIcon} />
          </div>

          <Flex flexDirection="column" alignItems="center" gap={8}>
            <Text size="sm" variant="supporting">
              {t('receipt.totalLabel')}
            </Text>
            <Heading as="h1" styledAs="h2" className={styles.totalAmount}>
              {formatNumberAsCurrency(parseFloat(receiptData.totals?.companyDebit || '0'))}
            </Heading>
          </Flex>
        </Flex>

        <div className={styles.receiptDetailsTable}>
          <DataView
            label={t('receipt.detailsLabel')}
            variant="minimal"
            breakAt="small"
            breakpoints={{
              base: '0rem',
              small: '22rem',
            }}
            columns={[
              {
                title: '',
                render: (item: { label: string; value: string }) => (
                  <Text size="sm" variant="supporting">
                    {item.label}
                  </Text>
                ),
              },
              {
                title: '',
                render: (item: { label: string; value: string }) => (
                  <Text size="sm">{item.value}</Text>
                ),
              },
            ]}
            data={receiptDetailsConfig}
          />
        </div>

        <Flex flexDirection="column" alignItems="center" gap={12}>
          <Text
            size="sm"
            variant="supporting"
            className={classNames(styles.disclaimer, isMobile && styles.textMobile)}
          >
            {receiptData.recipientNotice}
          </Text>

          <Text
            size="sm"
            variant="supporting"
            className={classNames(styles.companyInfo, isMobile && styles.textMobile)}
          >
            {receiptData.license}
          </Text>

          <Text
            size="sm"
            variant="supporting"
            className={classNames(styles.address, isMobile && styles.textMobile)}
          >
            {receiptData.licensee &&
              `${receiptData.licensee.address || ''}, ${receiptData.licensee.city || ''}, ${receiptData.licensee.state || ''} ${receiptData.licensee.postalCode || ''}`}
          </Text>
        </Flex>
      </Flex>
    </div>
  )

  const renderBreakdownSection = () => (
    <Flex flexDirection="column" gap={16}>
      <DataTable
        label={t('sections.debitedLabel')}
        columns={[
          {
            title: t('sections.debitedLabel'),
            render: (item: { label: string; amount: number }) => <Text>{item.label}</Text>,
          },
          {
            title: t('breakdown.amount'),
            render: (item: { label: string; amount: number }) => (
              <Text>{formatNumberAsCurrency(item.amount)}</Text>
            ),
          },
        ]}
        data={breakdownData}
        footer={() => ({
          'column-0': <Text weight="semibold">{t('breakdown.totals')}</Text>,
          'column-1': (
            <Text weight="semibold">
              {formatNumberAsCurrency(parseFloat(receiptData.totals?.companyDebit || '0'))}
            </Text>
          ),
        })}
      />
    </Flex>
  )

  const renderTaxBreakdown = () => (
    <Flex flexDirection="column" gap={16}>
      <DataTable
        label={t('sections.taxLabel')}
        columns={[
          {
            title: t('sections.taxLabel'),
            render: (tax: TaxBreakdownItem) => <Text>{tax.name}</Text>,
          },
          {
            title: t('tax.amount'),
            render: (tax: TaxBreakdownItem) => (
              <Text>{formatNumberAsCurrency(parseFloat(tax.amount || '0'))}</Text>
            ),
          },
        ]}
        data={receiptData.taxes || []}
        footer={() => ({
          'column-0': <Text weight="semibold">{t('breakdown.totals')}</Text>,
          'column-1': (
            <Text weight="semibold">
              {formatNumberAsCurrency(parseFloat(receiptData.totals?.taxDebit || '0'))}
            </Text>
          ),
        })}
      />
    </Flex>
  )

  const renderEmployeeBreakdown = () => (
    <Flex flexDirection="column" gap={16}>
      {isMobile && <Heading as="h2">{t('sections.employeesLabel')}</Heading>}
      <DataView
        label={t('sections.employeesLabel')}
        columns={[
          {
            title: t('employee.name'),
            render: (employee: EmployeeBreakdownItem) => (
              <Text>{getEmployeeFullName(employee)}</Text>
            ),
          },
          {
            title: t('employee.paymentMethod'),
            render: (employee: EmployeeBreakdownItem) => (
              <Text>{employee.paymentMethod || 'N/A'}</Text>
            ),
          },
          {
            title: t('employee.childSupport'),
            render: (employee: EmployeeBreakdownItem) => (
              <Text>
                {formatNumberAsCurrency(parseFloat(employee.childSupportGarnishment || '0'))}
              </Text>
            ),
          },
          {
            title: t('employee.reimbursement'),
            render: (employee: EmployeeBreakdownItem) => (
              <Text>{formatNumberAsCurrency(parseFloat(employee.totalReimbursement || '0'))}</Text>
            ),
          },
          {
            title: t('employee.totalTaxes'),
            render: (employee: EmployeeBreakdownItem) => (
              <Text>{formatNumberAsCurrency(parseFloat(employee.totalTax || '0'))}</Text>
            ),
          },
          {
            title: t('employee.netPay'),
            render: (employee: EmployeeBreakdownItem) => (
              <Text>{formatNumberAsCurrency(parseFloat(employee.netPay || '0'))}</Text>
            ),
          },
        ]}
        data={receiptData.employeeCompensations || []}
        footer={() => ({
          'column-0': (
            <Flex flexDirection="column" gap={4}>
              <Text weight="semibold">{t('breakdown.totals')}</Text>
              <Text size="sm" variant="supporting">
                {t('employee.totalEmployees', {
                  count: receiptData.employeeCompensations?.length || 0,
                })}
              </Text>
            </Flex>
          ),
          'column-1': <Text>{'\u00A0'}</Text>,
          'column-2': (
            <Text weight="semibold">{formatNumberAsCurrency(getTotalChildSupport())}</Text>
          ),
          'column-3': (
            <Text weight="semibold">{formatNumberAsCurrency(getTotalReimbursements())}</Text>
          ),
          'column-4': <Text weight="semibold">{formatNumberAsCurrency(getTotalTaxes())}</Text>,
          'column-5': <Text weight="semibold">{formatNumberAsCurrency(getTotalNetPay())}</Text>,
        })}
      />
    </Flex>
  )

  return (
    <div className={styles.container} ref={containerRef}>
      <Flex flexDirection="column" gap={24}>
        {renderReceiptHeader()}
        {renderBreakdownSection()}
        {renderTaxBreakdown()}
        {renderEmployeeBreakdown()}
      </Flex>
    </div>
  )
}
