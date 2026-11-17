import { useTranslation } from 'react-i18next'
import type {
  PayrollSubmissionBlockerType,
  UnblockOptions,
} from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import type { PaymentSpeed } from '@gusto/embedded-api/models/components/paymentconfigs'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import IconFast from '@/assets/icons/icon-zap-fast.svg?react'

type FastAchBlockerType = 'fast_ach_threshold_exceeded' | 'needs_earned_access_for_fast_ach'

interface FastAchSubmissionBlockerBannerProps {
  blocker: PayrollSubmissionBlockerType
  selectedValue?: string
  onUnblockOptionChange: (blockerType: string, value: string) => void
  paymentSpeed?: PaymentSpeed
}

/** @internal */
export const FastAchSubmissionBlockerBanner = ({
  blocker,
  selectedValue,
  onUnblockOptionChange,
  paymentSpeed,
}: FastAchSubmissionBlockerBannerProps) => {
  const { t } = useTranslation('Payroll.PayrollOverview')
  const { Banner, Text, RadioGroup, Badge, Checkbox } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const blockerType = (blocker.blockerType || 'fast_ach_threshold_exceeded') as FastAchBlockerType

  const titleKey =
    blockerType === 'fast_ach_threshold_exceeded'
      ? 'submissionBlockers.fast_ach_threshold_exceeded.title'
      : 'submissionBlockers.needs_earned_access_for_fast_ach.title'
  const title = t(titleKey, { days: paymentSpeed || '2-day' })
  const options = blocker.unblockOptions ?? []

  const renderOptionHeader = (option: UnblockOptions) => {
    const isWire = option.unblockType === 'wire_in'
    return (
      <Flex alignItems="center" gap={8} flexWrap="wrap">
        <Text weight="semibold">
          {isWire
            ? t('submissionBlockers.fastAchOptions.wireLabel')
            : t('submissionBlockers.fastAchOptions.directDepositLabel')}
        </Text>
        {isWire && (
          <Badge status="success">
            <IconFast aria-hidden /> {t('submissionBlockers.fastAchOptions.wireFastestBadge')}
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
    )
  }

  const getOptionDescription = (option: UnblockOptions) =>
    option.unblockType === 'wire_in'
      ? t('submissionBlockers.fastAchOptions.wireDescription')
      : t('submissionBlockers.fastAchOptions.directDepositDescription')

  const [onlyOption] = options
  if (options.length === 1 && onlyOption) {
    return (
      <Banner status="warning" title={title}>
        <Flex flexDirection="column" gap={16}>
          <Text>{t('submissionBlockers.fastAchOptions.singleOptionDescription')}</Text>
          <Flex flexDirection="column" gap={4}>
            {renderOptionHeader(onlyOption)}
            <Text variant="supporting">{getOptionDescription(onlyOption)}</Text>
          </Flex>
          <Checkbox
            label={t('submissionBlockers.fastAchOptions.acceptChangeLabel')}
            value={selectedValue === onlyOption.unblockType}
            onChange={isAccepted => {
              onUnblockOptionChange(blockerType, isAccepted ? onlyOption.unblockType || '' : '')
            }}
          />
        </Flex>
      </Banner>
    )
  }

  return (
    <Banner status="error" title={title}>
      <Flex flexDirection="column" gap={16}>
        <Text>{t('submissionBlockers.fastAchOptions.description')}</Text>
        <RadioGroup
          label={t('submissionBlockers.fastAchOptions.fundingOptionsLabel')}
          shouldVisuallyHideLabel
          options={options.map(option => ({
            value: option.unblockType || '',
            label: renderOptionHeader(option),
            description: getOptionDescription(option),
          }))}
          value={selectedValue}
          onChange={value => {
            onUnblockOptionChange(blockerType, value)
          }}
        />
      </Flex>
    </Banner>
  )
}
