import { PayrollConfigurationProvider } from './PayrollConfigurationProvider'
import { usePayrollConfiguration } from './usePayrollConfiguration'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface PayrollConfigurationProps {
  companyId: string
  payrollId: string
}

function PayrollConfiguration() {
  const { payrollData } = usePayrollConfiguration()
  const dateFormatter = useDateFormatter()
  const formatCurrency = useNumberFormatter('currency')
  const { Heading, Text } = useComponentContext()

  const payroll = payrollData.payrollShow

  const payrollDeadline = dateFormatter.formatWithTime(payroll?.payrollDeadline)

  return (
    <div>
      <Heading as="h1">Payroll Configuration (Experimental)</Heading>
      {payroll && (
        <div>
          <Heading as="h2">Payroll Details</Heading>
          <Text>
            <strong>Check Date:</strong> {dateFormatter.formatShortWithWeekday(payroll.checkDate)}
          </Text>
          <Text>
            <strong>Pay Period:</strong>{' '}
            {dateFormatter.formatPayPeriodRange(
              payroll.payPeriod?.startDate,
              payroll.payPeriod?.endDate,
            )}
          </Text>
          <Text>
            <strong>Payroll Deadline:</strong> {payrollDeadline.date} at {payrollDeadline.time}
          </Text>
          <Text>
            <strong>Calculated At:</strong>{' '}
            {payroll.calculatedAt
              ? dateFormatter.formatShortWithWeekday(payroll.calculatedAt)
              : 'Not yet calculated'}
          </Text>
          <Text>
            <strong>Off Cycle:</strong> {payroll.offCycle ? 'Yes' : 'No'}
          </Text>
          {payroll.totals && (
            <div>
              <Heading as="h3">Totals</Heading>
              <Text>
                <strong>Net Pay Debit:</strong>{' '}
                {formatCurrency(Number(payroll.totals.netPayDebit ?? 0))}
              </Text>
              <Text>
                <strong>Employee Taxes:</strong>{' '}
                {formatCurrency(Number(payroll.totals.employeeTaxes ?? 0))}
              </Text>
              <Text>
                <strong>Employer Taxes:</strong>{' '}
                {formatCurrency(Number(payroll.totals.employerTaxes ?? 0))}
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ComposedPayrollConfiguration({ companyId, payrollId }: PayrollConfigurationProps) {
  return (
    <PayrollConfigurationProvider companyId={companyId} payrollId={payrollId}>
      <PayrollConfiguration />
    </PayrollConfigurationProvider>
  )
}

export { ComposedPayrollConfiguration as PayrollConfiguration }
