import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { OffCycleTaxWithholdingTable } from '../OffCycleTaxWithholdingTable'
import { OffCycleTaxWithholdingModal } from '../OffCycleTaxWithholdingModal'
import {
  WAGE_TYPE_CATEGORIES,
  type WageTypeGroup,
} from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { TransitionCreationPresentationProps } from './TransitionCreationTypes'
import styles from './TransitionCreationPresentation.module.scss'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, DatePickerField, RadioGroupField } from '@/components/Common'
import { useDateFormatter } from '@/hooks/useDateFormatter'

export function TransitionCreationPresentation({
  startDate,
  endDate,
  payScheduleName,
  isPending,
  taxWithholdingConfig,
  isTaxWithholdingModalOpen,
  onTaxWithholdingEditClick,
  onTaxWithholdingModalDone,
  onTaxWithholdingModalCancel,
}: TransitionCreationPresentationProps) {
  useI18n('Payroll.TransitionCreation')
  useI18n('Payroll.OffCycleDeductionsSetting')
  useI18n('Payroll.OffCycleTaxWithholding')
  const { t } = useTranslation('Payroll.TransitionCreation')
  const { t: tDeductions } = useTranslation('Payroll.OffCycleDeductionsSetting')
  const { t: tWithholding } = useTranslation('Payroll.OffCycleTaxWithholding')
  const { Heading, Text, Alert, Button } = useComponentContext()
  const dateFormatter = useDateFormatter()

  const formattedStartDate = dateFormatter.formatShortWithYear(startDate)
  const formattedEndDate = dateFormatter.formatShortWithYear(endDate)

  const deductionsOptions = useMemo(
    () => [
      {
        value: false,
        label: tDeductions('options.include.label'),
      },
      {
        value: true,
        label: tDeductions('options.skip.label'),
      },
    ],
    [tDeductions],
  )

  const wageTypeGroups: WageTypeGroup[] = useMemo(
    () =>
      WAGE_TYPE_CATEGORIES.map(category => {
        const group: WageTypeGroup = {
          category,
          label: tWithholding(`wageTypeGroups.${category}.label`),
        }
        if (category === 'regular' || category === 'supplemental') {
          group.description = tWithholding(`wageTypeGroups.${category}.description`)
        }
        return group
      }),
    [tWithholding],
  )

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </Flex>

      <Alert status="info" label={t('transitionExplanation')} />

      <hr className={styles.divider} />

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

      <hr className={styles.divider} />

      <Flex flexDirection="column" gap={20}>
        <DatePickerField name="checkDate" label={t('checkDateLabel')} isRequired />
      </Flex>

      <hr className={styles.divider} />

      <Flex flexDirection="column" gap={20}>
        <RadioGroupField<boolean>
          name="skipRegularDeductions"
          label={tDeductions('title')}
          description={tDeductions('description')}
          options={deductionsOptions}
          convertValueToString={value => String(value)}
        />
      </Flex>

      <hr className={styles.divider} />

      <OffCycleTaxWithholdingTable
        wageTypeGroups={wageTypeGroups}
        config={taxWithholdingConfig}
        onEditClick={onTaxWithholdingEditClick}
      />
      {isTaxWithholdingModalOpen && (
        <OffCycleTaxWithholdingModal
          isOpen
          defaultConfig={taxWithholdingConfig}
          onDone={onTaxWithholdingModalDone}
          onCancel={onTaxWithholdingModalCancel}
        />
      )}

      <Flex justifyContent="flex-end" gap={12}>
        <Button type="submit" isLoading={isPending} isDisabled={isPending}>
          {t('continueCta')}
        </Button>
      </Flex>
    </Flex>
  )
}
