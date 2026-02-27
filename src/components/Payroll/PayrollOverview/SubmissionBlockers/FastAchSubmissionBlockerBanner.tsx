import { useTranslation } from 'react-i18next'
import type {
  PayrollSubmissionBlockerType,
  UnblockOptions,
} from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import IconFast from '@/assets/icons/icon-zap-fast.svg?react'

type FastAchBlockerType = 'fast_ach_threshold_exceeded' | 'needs_earned_access_for_fast_ach'

interface FastAchSubmissionBlockerBannerProps {
  blocker: PayrollSubmissionBlockerType
  selectedValue?: string
  onUnblockOptionChange: (blockerType: string, value: string) => void
  paymentSpeed?: string
}

export const FastAchSubmissionBlockerBanner = ({
  blocker,
  selectedValue,
  onUnblockOptionChange,
  paymentSpeed,
}: FastAchSubmissionBlockerBannerProps) => {
  const { t } = useTranslation('Payroll.PayrollOverview')
  const { Banner, Text, RadioGroup, Badge } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const blockerType = (blocker.blockerType || 'fast_ach_threshold_exceeded') as FastAchBlockerType

  const titleKey =
    blockerType === 'fast_ach_threshold_exceeded'
      ? 'submissionBlockers.fast_ach_threshold_exceeded.title'
      : 'submissionBlockers.needs_earned_access_for_fast_ach.title'

  return (
    <Banner status="error" title={t(titleKey, { days: paymentSpeed || '2-day' })}>
      <Flex flexDirection="column" gap={16}>
        <Text>{t('submissionBlockers.fastAchOptions.description')}</Text>
        <RadioGroup
          label={t('submissionBlockers.fastAchOptions.fundingOptionsLabel')}
          shouldVisuallyHideLabel
          options={
            blocker.unblockOptions?.map((option: UnblockOptions) => {
              const isWire = option.unblockType === 'wire_in'
              const label = isWire
                ? t('submissionBlockers.fastAchOptions.wireLabel')
                : t('submissionBlockers.fastAchOptions.directDepositLabel')
              const description = isWire
                ? t('submissionBlockers.fastAchOptions.wireDescription')
                : t('submissionBlockers.fastAchOptions.directDepositDescription')

              return {
                value: option.unblockType || '',
                label: (
                  <Flex alignItems="center" gap={8}>
                    <Text weight="semibold">{label}</Text>
                    {isWire && (
                      <Badge status="success">
                        <IconFast aria-hidden />{' '}
                        {t('submissionBlockers.fastAchOptions.wireFastestBadge')}
                      </Badge>
                    )}
                    {option.checkDate && (
                      <Badge status="info">
                        {t('submissionBlockers.fastAchOptions.employeePayDate', {
                          date: dateFormatter.formatShortWithYear(option.checkDate),
                        })}
                      </Badge>
                    )}
                  </Flex>
                ),
                description,
              }
            }) || []
          }
          value={selectedValue}
          onChange={value => {
            onUnblockOptionChange(blockerType, value)
          }}
        />
      </Flex>
    </Banner>
  )
}
