import { useTranslation } from 'react-i18next'
import type { PayrollSubmissionBlockersType } from '@gusto/embedded-api/models/components/payrollsubmissionblockerstype'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import IconFast from '@/assets/icons/icon-zap-fast.svg?react'

interface FastAchThresholdExceededProps {
  blocker: PayrollSubmissionBlockersType
  selectedValue?: string
  onUnblockOptionChange: (blockerType: string, value: string) => void
}

export const FastAchThresholdExceeded = ({
  blocker,
  selectedValue,
  onUnblockOptionChange,
}: FastAchThresholdExceededProps) => {
  const { t } = useTranslation('Payroll.PayrollOverview')
  const { Banner, Text, RadioGroup, Badge } = useComponentContext()
  const dateFormatter = useDateFormatter()

  return (
    <Banner status="error" title={t('submissionBlockers.fast_ach_threshold_exceeded.title')}>
      <Flex flexDirection="column" gap={16}>
        <Text>{t('submissionBlockers.fast_ach_threshold_exceeded.description')}</Text>
        <RadioGroup
          label={t('submissionBlockers.fast_ach_threshold_exceeded.fundingOptionsLabel')}
          shouldVisuallyHideLabel
          options={
            blocker.unblockOptions?.map(option => {
              const isWire = option.unblockType === 'wire_in'
              const label = isWire
                ? t('submissionBlockers.fast_ach_threshold_exceeded.wireLabel')
                : t('submissionBlockers.fast_ach_threshold_exceeded.directDepositLabel')
              const description = isWire
                ? t('submissionBlockers.fast_ach_threshold_exceeded.wireDescription')
                : t('submissionBlockers.fast_ach_threshold_exceeded.directDepositDescription')

              return {
                value: option.unblockType || '',
                label: (
                  <Flex alignItems="center" gap={8}>
                    <Text weight="semibold">{label}</Text>
                    {isWire && (
                      <Badge status="success">
                        <IconFast aria-hidden />{' '}
                        {t('submissionBlockers.fast_ach_threshold_exceeded.wireFastestBadge')}
                      </Badge>
                    )}
                    {option.checkDate && (
                      <Badge status="info">
                        {t('submissionBlockers.fast_ach_threshold_exceeded.employeePayDate', {
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
            onUnblockOptionChange('fast_ach_threshold_exceeded', value)
          }}
        />
      </Flex>
    </Banner>
  )
}
