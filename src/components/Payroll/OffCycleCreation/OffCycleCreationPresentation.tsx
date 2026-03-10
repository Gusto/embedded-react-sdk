import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { OffCycleReasonSelectionPresentation } from '../OffCycleReasonSelection'
import { OffCyclePayPeriodDateFormPresentation } from '../OffCyclePayPeriodDateForm/OffCyclePayPeriodDateFormPresentation'
import { OffCycleTaxWithholdingTable } from '../OffCycleTaxWithholdingTable'
import { OffCycleTaxWithholdingModal } from '../OffCycleTaxWithholdingModal'
import {
  WAGE_TYPE_CATEGORIES,
  type WageTypeGroup,
} from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type {
  OffCycleCreationFormData,
  OffCycleCreationPresentationProps,
} from './OffCycleCreationTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, RadioGroupField, SwitchField, MultiSelectComboBoxField } from '@/components/Common'

export function OffCycleCreationPresentation({
  employees,
  isLoadingEmployees,
  isPending,
  taxWithholdingConfig,
  isTaxWithholdingModalOpen,
  onTaxWithholdingEditClick,
  onTaxWithholdingModalDone,
  onTaxWithholdingModalCancel,
}: OffCycleCreationPresentationProps) {
  useI18n('Payroll.OffCycleCreation')
  useI18n('Payroll.OffCycleDeductionsSetting')
  useI18n('Payroll.EmployeeSelection')
  useI18n('Payroll.OffCycleTaxWithholding')
  const { t } = useTranslation('Payroll.OffCycleCreation')
  const { t: tDeductions } = useTranslation('Payroll.OffCycleDeductionsSetting')
  const { t: tEmployees } = useTranslation('Payroll.EmployeeSelection')
  const { t: tWithholding } = useTranslation('Payroll.OffCycleTaxWithholding')
  const { Heading, Text, Button } = useComponentContext()

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

  const { setValue, watch } = useFormContext<OffCycleCreationFormData>()
  const includeAllEmployees = watch('includeAllEmployees')

  const handleToggleIncludeAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setValue('selectedEmployeeUuids', [])
      }
    },
    [setValue],
  )

  const deductionsOptions = [
    {
      value: false,
      label: tDeductions('options.include.label'),
    },
    {
      value: true,
      label: tDeductions('options.skip.label'),
    },
  ]

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <OffCyclePayPeriodDateFormPresentation />
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <OffCycleReasonSelectionPresentation name="reason" />
      </Flex>

      <Flex flexDirection="column" gap={12}>
        <Heading as="h3">{tEmployees('sectionTitle')}</Heading>
        <SwitchField
          name="includeAllEmployees"
          label={t('includeAllEmployeesLabel')}
          onChange={handleToggleIncludeAll}
        />
        {!includeAllEmployees && (
          <MultiSelectComboBoxField
            name="selectedEmployeeUuids"
            label={tEmployees('sectionTitle')}
            shouldVisuallyHideLabel
            placeholder={tEmployees('searchPlaceholder')}
            options={employees}
            isLoading={isLoadingEmployees}
          />
        )}
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <RadioGroupField<boolean>
          name="skipRegularDeductions"
          label={tDeductions('title')}
          description={tDeductions('description')}
          options={deductionsOptions}
          convertValueToString={value => String(value)}
        />
      </Flex>

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
