import { useTranslation } from 'react-i18next'
import type {
  EmployeeCompensations,
  PayrollShow,
} from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { TFunction } from 'i18next'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { useState } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useLocale } from '@/contexts/LocaleProvider'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import { firstLastName } from '@/helpers/formattedStrings'

interface PayrollOverviewProps {
  payrollData: PayrollShow
  bankAccount?: CompanyBankAccount
  employeeDetails: Employee[]
  onEdit: () => void
  onSubmit: () => void
}

const getPayrollOverviewTitle = ({
  payPeriod,
  locale,
  t,
}: {
  payPeriod?: PayrollPayPeriodType
  locale: string
  t: TFunction<'Payroll.PayrollOverview'>
}) => {
  if (payPeriod?.startDate && payPeriod.endDate) {
    const startDate = parseDateStringToLocal(payPeriod.startDate)
    const endDate = parseDateStringToLocal(payPeriod.endDate)

    if (startDate && endDate) {
      const startFormatted = startDate.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
      })
      const endFormatted = endDate.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return t('pageSubtitle', { startDate: startFormatted, endDate: endFormatted })
    }
  }
  return t('pageSubtitle', { startDate: '', endDate: '' })
}
export const PayrollOverviewPresentation = ({
  onEdit,
  onSubmit,
  employeeDetails,
  payrollData,
  bankAccount,
}: PayrollOverviewProps) => {
  const { Alert, Button, Heading, Text, Tabs } = useComponentContext()
  useI18n('Payroll.PayrollOverview')
  const { locale } = useLocale()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const formatCurrency = useNumberFormatter('currency')
  const [selectedTab, setSelectedTab] = useState('companyPays')

  //TODO: is this right? check with gws-flows
  const totalPayroll = payrollData.totals
    ? parseFloat(payrollData.totals.grossPay!) +
      parseFloat(payrollData.totals.employerTaxes!) +
      parseFloat(payrollData.totals.reimbursements!) +
      parseFloat(payrollData.totals.benefits!)
    : 0

  const expectedDebitDate = payrollData.payrollStatusMeta?.expectedDebitTime
    ? parseDateStringToLocal(payrollData.payrollStatusMeta.expectedDebitTime)
    : payrollData.payrollDeadline!

  const getCompanyTaxes = (employeeCompensation: EmployeeCompensations) => {
    return (
      employeeCompensation.taxes?.reduce(
        (acc, tax) => (tax.employer ? acc + tax.amount : acc),
        0,
      ) ?? 0
    )
  }
  const getCompanyBenefits = (employeeCompensation: EmployeeCompensations) => {
    return (
      employeeCompensation.benefits?.reduce(
        (acc, benefit) => (benefit.companyContribution ? acc + benefit.companyContribution : acc),
        0,
      ) ?? 0
    )
  }
  const getReimbursements = (employeeCompensation: EmployeeCompensations) => {
    return employeeCompensation.fixedCompensations?.length
      ? parseFloat(
          employeeCompensation.fixedCompensations?.find(
            c => c.name?.toLowerCase() === 'reimbursement',
          )?.amount || '0',
        )
      : 0
  }

  const getCompanyCost = (employeeCompensation: EmployeeCompensations) => {
    return (
      employeeCompensation.grossPay! +
      getReimbursements(employeeCompensation) +
      getCompanyTaxes(employeeCompensation) +
      getCompanyBenefits(employeeCompensation)
    )
  }

  const emplpoyeeMap = new Map(employeeDetails.map(employee => [employee.uuid, employee]))

  return (
    <Flex flexDirection="column" alignItems="stretch">
      <Flex justifyContent="space-between">
        <div>
          <Heading as="h1">{t('pageTitle')}</Heading>
          <Text>{getPayrollOverviewTitle({ payPeriod: payrollData.payPeriod, locale, t })}</Text>
        </div>
        <Flex justifyContent="flex-end">
          <Button title={t('buttons.editTitle')} onClick={onEdit} variant="secondary">
            {t('buttons.edit')}
          </Button>
          <Button title={t('buttons.submitTitle')} onClick={onSubmit}>
            {t('buttons.submit')}
          </Button>
        </Flex>
      </Flex>
      {/* TODO: when is this actually saved? */}
      <Alert label={t('alerts.progressSaved')} status="success"></Alert>
      <Alert
        label={t('alerts.directDepositDeadline', {
          payDate: parseDateStringToLocal(payrollData.checkDate!)?.toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric',
          }),
          deadline: payrollData.payrollDeadline?.toLocaleString(locale, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        })}
        status="warning"
      >
        {t('alerts.missedDeadlineWarning')}
      </Alert>
      <Heading as="h3">{t('payrollSummaryTitle')}</Heading>
      <DataView
        label={t('payrollSummaryLabel')}
        columns={[
          {
            title: t('tableHeaders.totalPayroll'),
            render: () => <Text>{formatCurrency(totalPayroll)}</Text>,
          },
          {
            title: t('tableHeaders.debitAmount'),
            render: () => (
              <Text>{formatCurrency(parseFloat(payrollData.totals?.companyDebit ?? '0'))}</Text>
            ),
          },
          {
            title: t('tableHeaders.debitAccount'),
            render: () => <Text>{bankAccount?.hiddenAccountNumber ?? ''}</Text>,
          },
          {
            title: t('tableHeaders.debitDate'),
            render: () => (
              <Text>
                {expectedDebitDate?.toLocaleString(locale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            ),
          },
          {
            title: t('tableHeaders.employeesPayDate'),
            render: () => (
              <Text>
                {parseDateStringToLocal(payrollData.checkDate!)?.toLocaleDateString(locale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            ),
          },
        ]}
        data={[{}]}
      />
      <Tabs
        onSelectionChange={setSelectedTab}
        selectedId={selectedTab}
        aria-label={t('dataViews.label')}
        tabs={[
          {
            id: 'companyPays',
            label: t('dataViews.companyPaysTab'),
            content: (
              <DataView
                label={t('dataViews.companyPaysTab')}
                columns={[
                  {
                    title: t('tableHeaders.employees'),
                    render: (employeeCompensations: EmployeeCompensations) => (
                      <Text>
                        {firstLastName({
                          first_name: emplpoyeeMap.get(employeeCompensations.employeeUuid!)
                            ?.firstName,
                          last_name: emplpoyeeMap.get(employeeCompensations.employeeUuid!)
                            ?.lastName,
                        })}
                      </Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.grossPay'),
                    render: (employeeCompensations: EmployeeCompensations) => (
                      <Text>{formatCurrency(employeeCompensations.grossPay!)}</Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.reimbursements'),
                    render: (employeeCompensation: EmployeeCompensations) => (
                      <Text>{formatCurrency(getReimbursements(employeeCompensation))}</Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.companyTaxes'),
                    render: (employeeCompensation: EmployeeCompensations) => (
                      <Text>{formatCurrency(getCompanyTaxes(employeeCompensation))}</Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.companyBenefits'),
                    render: (employeeCompensation: EmployeeCompensations) => (
                      <Text>{formatCurrency(getCompanyBenefits(employeeCompensation))}</Text>
                    ),
                  },
                  {
                    title: t('tableHeaders.companyPays'),
                    render: (employeeCompensation: EmployeeCompensations) => (
                      <Text>{formatCurrency(getCompanyCost(employeeCompensation))}</Text>
                    ),
                  },
                ]}
                data={payrollData.employeeCompensations!}
              />
            ),
          },
        ]}
      />
    </Flex>
  )
}
