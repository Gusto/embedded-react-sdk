import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatPayRate } from '@/helpers/formattedStrings'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

export interface JobAndPayViewProps {
  job?: Job
  paymentMethod?: EmployeePaymentMethod
  bankAccounts?: unknown[]
  garnishments?: Garnishment[]
  payStubs?: unknown[]
  isFetchingGarnishments?: boolean
  isFetchingPayStubs?: boolean
  isLoading?: boolean
}

export function JobAndPayView({
  job,
  paymentMethod,
  bankAccounts = [],
  garnishments = [],
  payStubs = [],
  isFetchingGarnishments = false,
  isFetchingPayStubs = false,
  isLoading = false,
}: JobAndPayViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const formatPayRate = useFormatPayRate()
  const { locale } = useLocale()

  if (isLoading) {
    return <Loading />
  }

  const bankAccountsColumns = [
    {
      key: 'nickname',
      title: t('jobAndPay.payment.nickname'),
      render: (bankAccount: any) => bankAccount.name || '-',
    },
    {
      key: 'routingNumber',
      title: t('jobAndPay.payment.routingNumber'),
      render: (bankAccount: any) => bankAccount.routingNumber || '-',
    },
    {
      key: 'accountType',
      title: t('jobAndPay.payment.accountType'),
      render: (bankAccount: any) => bankAccount.accountType || '-',
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
          return formatNumberAsCurrency(garnishment.amount, locale)
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
      render: (payStub: any) => formatDateLongWithYear(payStub.payDate) || '-',
    },
    {
      key: 'checkAmount',
      title: t('jobAndPay.paystubs.checkAmount'),
      render: (payStub: any) =>
        payStub.employeeCompensation?.netPay && typeof payStub.employeeCompensation.netPay === 'number'
          ? formatNumberAsCurrency(payStub.employeeCompensation.netPay, locale)
          : '-',
    },
    {
      key: 'grossPay',
      title: t('jobAndPay.paystubs.grossPay'),
      render: (payStub: any) =>
        payStub.employeeCompensation?.grossPay && typeof payStub.employeeCompensation.grossPay === 'number'
          ? formatNumberAsCurrency(payStub.employeeCompensation.grossPay, locale)
          : '-',
    },
    {
      key: 'paymentMethod',
      title: t('jobAndPay.paystubs.paymentMethod'),
      render: () => 'Direct deposit',
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
    isFetching: isFetchingGarnishments,
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
    isFetching: isFetchingPayStubs,
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.paystubs.emptyState.title')}
        description={t('jobAndPay.paystubs.emptyState.description')}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          <Flex justifyContent="space-between" alignItems="center">
            <Components.Heading as="h3">{t('jobAndPay.compensation.title')}</Components.Heading>
            <Components.Button variant="secondary">
              {t('jobAndPay.compensation.edit')}
            </Components.Button>
          </Flex>

          <Flex flexDirection="column" gap={12}>
            {job?.title && (
              <Flex flexDirection="column" gap={4}>
                <Components.Text weight="medium">
                  {t('jobAndPay.compensation.jobTitle')}
                </Components.Text>
                <Components.Text>{job.title}</Components.Text>
              </Flex>
            )}

            {job?.paymentUnit && (
              <Flex flexDirection="column" gap={4}>
                <Components.Text weight="medium">{t('jobAndPay.compensation.type')}</Components.Text>
                <Components.Text>
                  {job.paymentUnit === 'Hour' ? 'Salary/No overtime' : job.paymentUnit}
                </Components.Text>
              </Flex>
            )}

            {job?.rate && job?.paymentUnit && typeof job.rate === 'number' && (
              <Flex flexDirection="column" gap={4}>
                <Components.Text weight="medium">{t('jobAndPay.compensation.wage')}</Components.Text>
                <Components.Text>{formatPayRate(job.rate, job.paymentUnit)}</Components.Text>
              </Flex>
            )}

            {job?.hireDate && (
              <Flex flexDirection="column" gap={4}>
                <Components.Text weight="medium">
                  {t('jobAndPay.compensation.startDate')}
                </Components.Text>
                <Components.Text>{formatDateLongWithYear(job.hireDate)}</Components.Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Components.Box>

      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          <Flex justifyContent="space-between" alignItems="center">
            <Components.Heading as="h3">{t('jobAndPay.payment.title')}</Components.Heading>
            <Components.Button variant="secondary">
              {t('jobAndPay.payment.addBankAccount')}
            </Components.Button>
          </Flex>

          <DataView label={t('jobAndPay.payment.listLabel')} {...bankAccountsDataView} />
        </Flex>
      </Components.Box>

      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          <Flex justifyContent="space-between" alignItems="center">
            <Components.Heading as="h3">{t('jobAndPay.deductions.title')}</Components.Heading>
            <Components.Button variant="secondary">
              {t('jobAndPay.deductions.addDeduction')}
            </Components.Button>
          </Flex>

          <DataView label={t('jobAndPay.deductions.listLabel')} {...garnishmentsDataView} />
        </Flex>
      </Components.Box>

      <Components.Box>
        <Flex flexDirection="column" gap={16}>
          <Components.Heading as="h3">{t('jobAndPay.paystubs.title')}</Components.Heading>

          <DataView label={t('jobAndPay.paystubs.listLabel')} {...payStubsDataView} />
        </Flex>
      </Components.Box>
    </Flex>
  )
}
