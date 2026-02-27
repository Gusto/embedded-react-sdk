import { useTranslation } from 'react-i18next'
import type { PayrollSubmissionBlockerType } from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
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
  const { t } = useTranslation('Contractor.Payments.CreatePayment')
  const { Banner, Text, RadioGroup, Badge } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const blockerType = (blocker.blockerType || 'fast_ach_threshold_exceeded') as FastAchBlockerType

  const titleKey = 
    blockerType === 'fast_ach_threshold_exceeded'
      ? 'previewPresentation.submissionBlockers.fast_ach_threshold_exceeded.title'
      : 'previewPresentation.submissionBlockers.needs_earned_access_for_fast_ach.title'

  return (
    <Banner status="error" title={t(titleKey, { days: paymentSpeed || '2-day' })}>
      <Flex flexDirection="column" gap={16}>
        <Text>{t('previewPresentation.submissionBlockers.fastAchOptions.description')}</Text>
        <RadioGroup
          label={t('previewPresentation.submissionBlockers.fastAchOptions.fundingOptionsLabel')}
          shouldVisuallyHideLabel
          options={
            blocker.unblockOptions?.map(option => {
              const isWire = option.unblockType === 'wire_in'
              const label = isWire
                ? t('previewPresentation.submissionBlockers.fastAchOptions.wireLabel')
                : t('previewPresentation.submissionBlockers.fastAchOptions.directDepositLabel')
              const description = isWire
                ? t('previewPresentation.submissionBlockers.fastAchOptions.wireDescription')
                : t(
                    'previewPresentation.submissionBlockers.fastAchOptions.directDepositDescription',
                  )

              return {
                value: option.unblockType || '',
                label: (
                  <Flex alignItems="center" gap={8}>
                    <Text weight="semibold">{label}</Text>
                    {isWire && (
                      <Badge status="success">
                        <IconFast aria-hidden />{' '}
                        {t(
                          'previewPresentation.submissionBlockers.fastAchOptions.wireFastestBadge',
                        )}
                      </Badge>
                    )}
                    {option.checkDate && (
                      <Badge status="info">
                        {t(
                          'previewPresentation.submissionBlockers.fastAchOptions.contractorPayDate',
                          {
                            date: dateFormatter.formatShortWithYear(option.checkDate),
                          },
                        )}
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
