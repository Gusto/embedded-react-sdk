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
import { compensationTypeLabels, FlsaStatus } from '@/shared/constants'

interface PayrollOverviewProps {
  payrollData: PayrollShow
  bankAccount?: CompanyBankAccount
  employeeDetails: Employee[]
  taxes: Record<string, { employee: number; employer: number }>
  isSubmitting?: boolean
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
  taxes,
  isSubmitting = false,
}: PayrollOverviewProps) => {
  const { Alert, Button, Heading, Text, Tabs } = useComponentContext()
  useI18n('Payroll.PayrollOverview')
  const { locale } = useLocale()
  const { t } = useTranslation('Payroll.PayrollOverview')
  const formatCurrency = useNumberFormatter('currency')
  const [selectedTab, setSelectedTab] = useState('companyPays')

  const totalPayroll = payrollData.totals
    ? parseFloat(payrollData.totals.grossPay ?? '0') +
      parseFloat(payrollData.totals.employerTaxes ?? '0') +
      parseFloat(payrollData.totals.reimbursements ?? '0') +
      parseFloat(payrollData.totals.benefits ?? '0')
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
          employeeCompensation.fixedCompensations.find(
            c => c.name?.toLowerCase() === compensationTypeLabels.REIMBURSEMENT_NAME.toLowerCase(),
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

  const employeeMap = new Map(employeeDetails.map(employee => [employee.uuid, employee]))

  const getEmployeeHours = (
    employeeCompensations: EmployeeCompensations,
  ): Record<string, number> => {
    return (
      employeeCompensations.hourlyCompensations?.reduce(
        (acc, hourlyCompensation) => {
          if (typeof hourlyCompensation.name === 'undefined') {
            return acc
          }
          const name = hourlyCompensation.name.toLowerCase()
          const currentHours = acc[name] ?? 0
          acc[name] = currentHours + parseFloat(hourlyCompensation.hours || '0')
          return acc
        },
        {} as Record<string, number>,
      ) || {}
    )
  }
  const getEmployeePtoHours = (employeeCompensations: EmployeeCompensations) => {
    return (
      employeeCompensations.paidTimeOff?.reduce((acc, paidTimeOff) => {
        return acc + parseFloat(paidTimeOff.hours || '0')
      }, 0) ?? 0
    )
  }

  const tabs = [
    {
      id: 'companyPays',
      label: t('dataViews.companyPaysTab'),
      content: (
        <DataView
          label={t('dataViews.companyPaysTable')}
          columns={[
            {
              title: t('tableHeaders.employees'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {firstLastName({
                    first_name: employeeMap.get(employeeCompensations.employeeUuid!)?.firstName,
                    last_name: employeeMap.get(employeeCompensations.employeeUuid!)?.lastName,
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
    {
      id: 'hoursWorked',
      label: t('dataViews.hoursWorkedTab'),
      content: (
        <DataView
          label={t('dataViews.hoursWorkedTable')}
          columns={[
            {
              title: t('tableHeaders.employees'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {firstLastName({
                    first_name: employeeMap.get(employeeCompensations.employeeUuid!)?.firstName,
                    last_name: employeeMap.get(employeeCompensations.employeeUuid!)?.lastName,
                  })}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.compensationType'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {employeeMap
                    .get(employeeCompensations.employeeUuid!)
                    ?.jobs?.reduce((acc, job) => {
                      if (job.primary) {
                        const flsaStatus = job.compensations?.find(
                          comp => comp.uuid === job.currentCompensationUuid,
                        )?.flsaStatus

                        switch (flsaStatus) {
                          case FlsaStatus.EXEMPT:
                            return t('compensationTypeLabels.exempt')
                          case FlsaStatus.NONEXEMPT:
                            return t('compensationTypeLabels.nonexempt')
                          default:
                            return flsaStatus ?? ''
                        }
                      }
                      return acc
                    }, '')}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.regular'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {getEmployeeHours(employeeCompensations)[
                    compensationTypeLabels.REGULAR_HOURS_NAME
                  ] || 0}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.overtime'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {getEmployeeHours(employeeCompensations)[compensationTypeLabels.OVERTIME_NAME] ||
                    0}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.doubleOT'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {getEmployeeHours(employeeCompensations)[
                    compensationTypeLabels.DOUBLE_OVERTIME_NAME
                  ] || 0}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.timeOff'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>{getEmployeePtoHours(employeeCompensations)}</Text>
              ),
            },
            {
              title: t('tableHeaders.totalHours'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {Object.values(getEmployeeHours(employeeCompensations)).reduce(
                    (acc, hours) => acc + hours,
                    0,
                  ) + getEmployeePtoHours(employeeCompensations)}
                </Text>
              ),
            },
          ]}
          data={payrollData.employeeCompensations!}
        />
      ),
    },
    {
      id: 'employeeTakeHome',
      label: t('dataViews.employeeTakeHomeTab'),
      content: (
        <DataView
          label={t('dataViews.employeeTakeHomeTable')}
          columns={[
            {
              title: t('tableHeaders.employees'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {firstLastName({
                    first_name: employeeMap.get(employeeCompensations.employeeUuid!)?.firstName,
                    last_name: employeeMap.get(employeeCompensations.employeeUuid!)?.lastName,
                  })}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.paymentType'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>{employeeCompensations.paymentMethod ?? ''}</Text>
              ),
            },
            {
              title: t('tableHeaders.grossPay'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>{formatCurrency(employeeCompensations.grossPay ?? 0)}</Text>
              ),
            },
            {
              title: t('tableHeaders.deductions'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {formatCurrency(
                    employeeCompensations.deductions?.reduce(
                      (acc, deduction) => acc + deduction.amount!,
                      0,
                    ) ?? 0,
                  )}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.reimbursements'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>{formatCurrency(getReimbursements(employeeCompensations))}</Text>
              ),
            },
            {
              title: t('tableHeaders.employeeTaxes'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {formatCurrency(
                    employeeCompensations.taxes?.reduce(
                      (acc, tax) => (tax.employer ? acc : acc + tax.amount),
                      0,
                    ) ?? 0,
                  )}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.employeeBenefits'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>
                  {formatCurrency(
                    employeeCompensations.benefits?.reduce(
                      (acc, benefit) => acc + (benefit.employeeDeduction ?? 0),
                      0,
                    ) ?? 0,
                  )}
                </Text>
              ),
            },
            {
              title: t('tableHeaders.payment'),
              render: (employeeCompensations: EmployeeCompensations) => (
                <Text>{formatCurrency(employeeCompensations.netPay ?? 0)}</Text>
              ),
            },
          ]}
          data={payrollData.employeeCompensations!}
        />
      ),
    },
    {
      id: 'taxes',
      label: t('dataViews.taxesTab'),
      content: (
        <Flex flexDirection="column" gap={32}>
          <DataView
            label={t('dataViews.taxesTable')}
            columns={[
              {
                key: 'taxDescription',
                title: t('tableHeaders.taxDescription'),
                render: taxKey => <Text>{taxKey}</Text>,
              },
              {
                key: 'byYourEmployees',
                title: t('tableHeaders.byYourEmployees'),
                render: taxKey => <Text>{formatCurrency(taxes[taxKey]?.employee ?? 0)}</Text>,
              },
              {
                key: 'byYourCompany',
                title: t('tableHeaders.byYourCompany'),
                render: taxKey => <Text>{formatCurrency(taxes[taxKey]?.employer ?? 0)}</Text>,
              },
            ]}
            footer={() => ({
              taxDescription: <Text>{t('totalsLabel')}</Text>,
              byYourEmployees: (
                <Text>{formatCurrency(parseFloat(payrollData.totals?.employeeTaxes ?? '0'))}</Text>
              ),
              byYourCompany: (
                <Text>{formatCurrency(parseFloat(payrollData.totals?.employerTaxes ?? '0'))}</Text>
              ),
            })}
            data={Object.keys(taxes)}
          />

          <DataView
            label={t('dataViews.debitedTable')}
            columns={[
              {
                title: t('tableHeaders.debitedByGusto'),
                render: ({ label }) => <Text>{label}</Text>,
              },
              {
                title: t('tableHeaders.taxesTotal'),
                render: ({ value }) => <Text>{formatCurrency(parseFloat(value))}</Text>,
              },
            ]}
            data={[
              { label: t('directDepositLabel'), value: payrollData.totals?.netPayDebit || '0' },
              {
                label: t('reimbursementLabel'),
                value: payrollData.totals?.reimbursementDebit || '0',
              },
              {
                label: t('garnishmentsLabel'),
                value: payrollData.totals?.childSupportDebit || '0',
              },
              { label: t('taxesLabel'), value: payrollData.totals?.taxDebit || '0' },
            ]}
          />
        </Flex>
      ),
    },
  ]

  return (
    <Flex flexDirection="column" alignItems="stretch">
      <Flex justifyContent="space-between">
        <div>
          <Heading as="h1">{t('pageTitle')}</Heading>
          <Text>{getPayrollOverviewTitle({ payPeriod: payrollData.payPeriod, locale, t })}</Text>
        </div>
        <Flex justifyContent="flex-end">
          <Button onClick={onEdit} variant="secondary" isDisabled={isSubmitting}>
            {t('editCta')}
          </Button>
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {t('submitCta')}
          </Button>
        </Flex>
      </Flex>
      {/* TODO: when is this actually saved? */}
      <Alert label={t('alerts.progressSaved')} status="success"></Alert>
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
        tabs={tabs}
      />
    </Flex>
  )
}
