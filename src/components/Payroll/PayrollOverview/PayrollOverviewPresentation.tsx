import { useTranslation } from 'react-i18next'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { TFunction } from 'i18next'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useLocale } from '@/contexts/LocaleProvider'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'

interface PayrollOverviewProps {
  payrollData: PayrollShow
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
  payrollData,
}: PayrollOverviewProps) => {
  const { Alert, Button, Heading, Text } = useComponentContext()
  useI18n('Payroll.PayrollOverview')
  const { locale } = useLocale()
  const { t } = useTranslation('Payroll.PayrollOverview')

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
      <Heading as="h3">{t('sections.payrollSummary')}</Heading>
      <DataView
        label={t('dataViews.summary')}
        columns={[
          {
            title: t('tableHeaders.totalPayroll'),
            render: () => <Text>$32,161.22</Text>,
          },
          {
            title: t('tableHeaders.debitAmount'),
            render: () => <Text>$28,896.27</Text>,
          },
        ]}
        data={[{}]}
      />
      <DataView
        label={t('dataViews.configuration')}
        columns={[
          {
            title: t('tableHeaders.employees'),
            render: () => <Text>John Smith</Text>,
          },
          {
            title: t('tableHeaders.grossPay'),
            render: () => <Text>$2,345.16</Text>,
          },
          {
            title: t('tableHeaders.reimbursements'),
            render: () => <Text>$0.00</Text>,
          },
        ]}
        data={[{}]}
      />
    </Flex>
  )
}
