import { useTranslation } from 'react-i18next'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface PayrollOverviewProps {
  onEdit: () => void
  onSubmit: () => void
}

export const PayrollOverviewPresentation = ({ onEdit, onSubmit }: PayrollOverviewProps) => {
  const { Alert, Button, Heading, Text } = useComponentContext()
  useI18n('Payroll.PayrollOverview')
  const { t } = useTranslation('Payroll.PayrollOverview')

  return (
    <Flex flexDirection="column" alignItems="stretch">
      <Flex justifyContent="space-between">
        <Heading as="h1">{t('pageTitle', { startDate: 'Jul 5', endDate: 'Jul 18, 2025' })}</Heading>
        <Flex justifyContent="flex-end">
          <Button title={t('buttons.editTitle')} onClick={onEdit} variant="secondary">
            {t('buttons.edit')}
          </Button>
          <Button title={t('buttons.submitTitle')} onClick={onSubmit}>
            {t('buttons.submit')}
          </Button>
        </Flex>
      </Flex>
      <Alert label={t('alerts.progressSaved')} status="success"></Alert>
      <Alert
        label={t('alerts.directDepositDeadline', {
          payDate: 'Fri, Jul 25',
          deadline: '7:00 PM EDT on Wed, Jul 23',
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
