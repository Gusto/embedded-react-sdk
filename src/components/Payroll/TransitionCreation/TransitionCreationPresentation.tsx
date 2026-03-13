import { useTranslation } from 'react-i18next'
import type { TransitionCreationPresentationProps } from './TransitionCreationTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, DatePickerField } from '@/components/Common'
import { useDateFormatter } from '@/hooks/useDateFormatter'

export function TransitionCreationPresentation({
  startDate,
  endDate,
  payScheduleName,
  isPending,
}: TransitionCreationPresentationProps) {
  useI18n('Payroll.TransitionCreation')
  const { t } = useTranslation('Payroll.TransitionCreation')
  const { Heading, Text, Alert, Button } = useComponentContext()
  const dateFormatter = useDateFormatter()

  const formattedStartDate = dateFormatter.formatShortWithYear(startDate)
  const formattedEndDate = dateFormatter.formatShortWithYear(endDate)

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </Flex>

      <Alert status="info" label={t('transitionExplanation')} />

      <Flex flexDirection="column" gap={16}>
        <Heading as="h3">{t('detailsHeading')}</Heading>

        <Flex flexDirection="column" gap={8}>
          <Flex justifyContent="space-between">
            <Text weight="bold">{t('payPeriodLabel')}</Text>
            <Text>
              {formattedStartDate} - {formattedEndDate}
            </Text>
          </Flex>

          {payScheduleName && (
            <Flex justifyContent="space-between">
              <Text weight="bold">{t('payScheduleLabel')}</Text>
              <Text>{payScheduleName}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <DatePickerField name="checkDate" label={t('checkDateLabel')} isRequired />
      </Flex>

      <Flex justifyContent="flex-end" gap={12}>
        <Button type="submit" isLoading={isPending} isDisabled={isPending}>
          {t('continueCta')}
        </Button>
      </Flex>
    </Flex>
  )
}
