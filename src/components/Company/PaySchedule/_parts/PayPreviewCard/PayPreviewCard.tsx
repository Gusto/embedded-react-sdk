import { useTranslation } from 'react-i18next'
import styles from './PayPreviewCard.module.scss'
import { Card, Flex } from '@/components/Common'

export type PayPreviewCardProps = {
  checkdate: string | undefined
  endDate: string | undefined
  startDate: string | undefined
  runPayrollBy: string | undefined
}

export const PayPreviewCard: React.FC<PayPreviewCardProps> = ({
  checkdate,
  endDate,
  startDate,
  runPayrollBy,
}: PayPreviewCardProps) => {
  const { t } = useTranslation('Company.PaySchedule')
  return (
    <Card className={styles.payPreviewCard}>
      <Flex flexDirection="column" gap={4}>
        <div>
          <div className={styles.payPreviewHeading}>{t('payPreview.payPeriod')}</div>
          <div className={styles.payPreviewContent}>
            {startDate} - {endDate}
          </div>
        </div>
        <hr />
        <div>
          <div className={styles.payPreviewHeading}>{t('payPreview.payday')}</div>
          <div className={styles.payPreviewContent}>{checkdate}</div>
        </div>
        <hr />
        <div>
          <div className={styles.payPreviewHeading}>{t('payPreview.payrollDeadline')}</div>
          <div className={styles.payPreviewContent}>{runPayrollBy}</div>
        </div>
      </Flex>
    </Card>
  )
}
