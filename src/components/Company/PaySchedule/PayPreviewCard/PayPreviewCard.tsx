import { Card, Flex } from '@/components/Common'
import styles from './PayPreviewCard.module.scss'
import { useTranslation } from 'react-i18next'

export type PayPreviewCardProps = {
  checkdate: Date
  endDate: Date
  startDate: Date
  runPayrollBy: Date
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
          <div className={styles.payPreviewHeading}>{t('payPeriod')}</div>
          <div className={styles.payPreviewContent}>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
        </div>
        <hr />
        <div>
          <div className={styles.payPreviewHeading}>{t('payday')}</div>
          <div className={styles.payPreviewContent}>{checkdate.toLocaleDateString()}</div>
        </div>
        <hr />
        <div>
          <div className={styles.payPreviewHeading}>{t('runPayrollBy')}</div>
          <div className={styles.payPreviewContent}>{runPayrollBy.toLocaleDateString()}</div>
        </div>
      </Flex>
    </Card>
  )
}
