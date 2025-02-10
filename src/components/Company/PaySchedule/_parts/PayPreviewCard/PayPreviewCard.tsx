import { useTranslation } from 'react-i18next'
import { CalendarDisplay } from '@/components/Common'

export type PayPreviewCardProps = {
  checkdate: string
  endDate: string
  startDate: string
  runPayrollBy: string
  payPreviewSelector: React.ReactNode
}

export const PayPreviewCard: React.FC<PayPreviewCardProps> = ({
  checkdate,
  endDate,
  startDate,
  runPayrollBy,
  payPreviewSelector,
}: PayPreviewCardProps) => {
  const { t } = useTranslation('Company.PaySchedule')
  return (
    <CalendarDisplay
      selectionControl={payPreviewSelector}
      rangeSelected={{
        start: startDate,
        end: endDate,
        label: t('payPreview.payPeriod') || 'Pay Period',
      }}
      highlightDates={[
        {
          date: checkdate,
          highlightColor: 'black',
          label: t('payPreview.payday') || 'Payday',
        },
        {
          date: runPayrollBy,
          highlightColor: 'orange',
          label: t('payPreview.payrollDeadline') || 'Payroll Deadline',
        },
      ]}
    />
  )
}
