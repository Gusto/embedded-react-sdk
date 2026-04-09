import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatPayRate } from '@/helpers/formattedStrings'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import PercentCircleIcon from '@/assets/icons/percent-circle.svg?react'

type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

export interface JobAndPayViewProps {
  job?: Job
  paymentMethod?: EmployeePaymentMethod
  bankAccounts?: EmployeeBankAccount[]
  garnishments?: Garnishment[]
  payStubs?: EmployeePayStub[]
  payStubsPagination?: PaginationControlProps
  isLoading?: boolean
  onEditCompensation?: () => void
  onSplitPaycheck?: () => void
  onAddBankAccount?: () => void
  onAddDeduction?: () => void
}

export function JobAndPayView({
  job,
  paymentMethod,
  bankAccounts = [],
  garnishments = [],
  payStubs = [],
  payStubsPagination,
  isLoading = false,
  onEditCompensation,
  onSplitPaycheck,
  onAddBankAccount,
  onAddDeduction,
}: JobAndPayViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const formatPayRate = useFormatPayRate()
  const formatCurrency = useNumberFormatter('currency')

  const bankAccountsColumns = [
    {
      key: 'nickname',
      title: t('jobAndPay.payment.nickname'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.name || '-',
    },
    {
      key: 'routingNumber',
      title: t('jobAndPay.payment.routingNumber'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.routingNumber || '-',
    },
    {
      key: 'accountType',
      title: t('jobAndPay.payment.accountType'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.accountType || '-',
    },
  ]

  const garnishmentsColumns = [
    {
      key: 'description',
      title: t('jobAndPay.deductions.deduction'),
      render: (garnishment: Garnishment) => garnishment.description || '-',
    },
    {
      key: 'frequency',
      title: t('jobAndPay.deductions.frequency'),
      render: (garnishment: Garnishment) =>
        garnishment.recurring ? t('jobAndPay.deductions.recurring') : '-',
    },
    {
      key: 'amount',
      title: t('jobAndPay.deductions.withhold'),
      render: (garnishment: Garnishment) => {
        if (garnishment.amount && typeof garnishment.amount === 'number') {
          return formatCurrency(garnishment.amount)
        }
        if (garnishment.annualMaximum) {
          return `${garnishment.annualMaximum}% per paycheck`
        }
        return '-'
      },
    },
  ]

  const payStubsColumns = [
    {
      key: 'payday',
      title: t('jobAndPay.paystubs.payday'),
      render: (payStub: EmployeePayStub) => formatDateLongWithYear(payStub.checkDate) || '-',
    },
    {
      key: 'checkAmount',
      title: t('jobAndPay.paystubs.checkAmount'),
      render: (payStub: EmployeePayStub) => {
        if (!payStub.netPay) return '-'
        const amount = parseFloat(payStub.netPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'grossPay',
      title: t('jobAndPay.paystubs.grossPay'),
      render: (payStub: EmployeePayStub) => {
        if (!payStub.grossPay) return '-'
        const amount = parseFloat(payStub.grossPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'paymentMethod',
      title: t('jobAndPay.paystubs.paymentMethod'),
      render: () => paymentMethod?.type || t('jobAndPay.paystubs.noPaymentMethod'),
    },
  ]

  const bankAccountsDataView = useDataView({
    data: bankAccounts,
    columns: bankAccountsColumns,
    isFetching: false,
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.payment.emptyState.title')}
        description={t('jobAndPay.payment.emptyState.description')}
      />
    ),
  })

  const garnishmentsDataView = useDataView({
    data: garnishments,
    columns: garnishmentsColumns,
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.deductions.emptyState.title')}
        description={t('jobAndPay.deductions.emptyState.description')}
      />
    ),
  })

  const payStubsDataView = useDataView({
    data: payStubs,
    columns: payStubsColumns,
    pagination: payStubsPagination,
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.paystubs.emptyState.title')}
        description={t('jobAndPay.paystubs.emptyState.description')}
      />
    ),
  })
  if (isLoading) {
    return <Loading />
  }
  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('jobAndPay.compensation.title')}
            action={
              <Components.Button variant="secondary" onClick={onEditCompensation}>
                {t('jobAndPay.compensation.editCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Flex flexDirection="column" gap={12}>
            {job?.title && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('jobAndPay.compensation.jobTitle')}
                </Components.Text>
                <Components.Text>{job.title}</Components.Text>
              </Flex>
            )}

            {job?.paymentUnit && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('jobAndPay.compensation.type')}
                </Components.Text>
                <Components.Text>
                  {job.paymentUnit === 'Hour'
                    ? t('jobAndPay.compensation.types.hourly')
                    : job.paymentUnit === 'Salary' || job.paymentUnit === 'Year'
                      ? t('jobAndPay.compensation.types.salary')
                      : job.paymentUnit}
                </Components.Text>
              </Flex>
            )}

            {job?.rate && job.paymentUnit && typeof job.rate === 'number' && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('jobAndPay.compensation.wage')}
                </Components.Text>
                <Components.Text>{formatPayRate(job.rate, job.paymentUnit)}</Components.Text>
              </Flex>
            )}

            {job?.hireDate && (
              <Flex flexDirection="column" gap={0}>
                <Components.Text variant="supporting">
                  {t('jobAndPay.compensation.startDate')}
                </Components.Text>
                <Components.Text>{formatDateLongWithYear(job.hireDate)}</Components.Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Components.Box>

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('jobAndPay.payment.title')}
            action={
              <Flex gap={8} alignItems="flex-end">
                <Components.Button
                  variant="secondary"
                  onClick={onSplitPaycheck}
                  icon={<PercentCircleIcon />}
                >
                  {t('jobAndPay.payment.splitPaycheckCta')}
                </Components.Button>
                <Components.Button
                  variant="secondary"
                  onClick={onAddBankAccount}
                  icon={<PlusCircleIcon />}
                >
                  {t('jobAndPay.payment.addBankAccountCta')}
                </Components.Button>
              </Flex>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          <DataView label={t('jobAndPay.payment.listLabel')} {...bankAccountsDataView} />
        </Flex>
      </Components.Box>

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('jobAndPay.deductions.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={onAddDeduction}
                icon={<PlusCircleIcon />}
              >
                {t('jobAndPay.deductions.addDeductionCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          <DataView label={t('jobAndPay.deductions.listLabel')} {...garnishmentsDataView} />
        </Flex>
      </Components.Box>

      <Components.Box header={<Components.BoxHeader title={t('jobAndPay.paystubs.title')} />}>
        <Flex flexDirection="column" gap={16}>
          <DataView label={t('jobAndPay.paystubs.listLabel')} {...payStubsDataView} />
        </Flex>
      </Components.Box>
    </Flex>
  )
}
