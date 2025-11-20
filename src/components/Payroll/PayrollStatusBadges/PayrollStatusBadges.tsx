import { useTranslation } from 'react-i18next'
import type { PayrollInput, WireInRequestInput } from '../statusConfig'
import { usePayrollStatusBadge } from '../usePayrollStatusBadge'
import styles from './PayrollStatusBadges.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface PayrollStatusBadgesProps {
  payroll: PayrollInput
  wireInRequest?: WireInRequestInput
}

export const PayrollStatusBadges = ({ payroll, wireInRequest }: PayrollStatusBadgesProps) => {
  const { Badge } = useComponentContext()
  useI18n('Payroll.Common')
  const { t } = useTranslation('Payroll.Common')

  const { badges } = usePayrollStatusBadge(payroll, wireInRequest)

  const translateStatus = (
    translationKey: string,
    params?: Record<string, string | number>,
  ): string => {
    const options: Record<string, string | number> = { ...params }

    if (params?.hours !== undefined) {
      options.count = params.hours
    } else if (params?.days !== undefined) {
      options.count = params.days
    }

    return t(`status.${translationKey}` as never, options as never) as unknown as string
  }

  return (
    <div className={styles.statusCell}>
      <div className={styles.badges}>
        {badges.map((badge, index) => (
          <span key={index}>
            <Badge status={badge.variant}>
              {translateStatus(badge.translationKey, badge.translationParams)}
            </Badge>
          </span>
        ))}
      </div>
    </div>
  )
}
