import { useTranslation } from 'react-i18next'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleType } from './ManagePayScheduleTypeSelection'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex, ActionsLayout } from '@/components/Common'

interface ManagePayScheduleTypeSelectionPresentationProps {
  selectedType: PayScheduleType
  onTypeChange: (value: string) => void
  onContinue: () => void
  onBack: () => void
}

export function ManagePayScheduleTypeSelectionPresentation({
  selectedType,
  onTypeChange,
  onContinue,
  onBack,
}: ManagePayScheduleTypeSelectionPresentationProps) {
  useI18n('CompanyManagement.ManagePayScheduleTypeSelection')
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleTypeSelection')
  const { Heading, Text, RadioGroup, Button } = useComponentContext()

  const scheduleTypeOptions = [
    {
      value: PayScheduleAssignmentBodyType.Single,
      label: t('options.single.label'),
      description: t('options.single.description'),
    },
    {
      value: PayScheduleAssignmentBodyType.HourlySalaried,
      label: t('options.hourlySalaried.label'),
      description: t('options.hourlySalaried.description'),
    },
    {
      value: PayScheduleAssignmentBodyType.ByEmployee,
      label: t('options.byEmployee.label'),
      description: t('options.byEmployee.description'),
    },
    {
      value: PayScheduleAssignmentBodyType.ByDepartment,
      label: t('options.byDepartment.label'),
      description: t('options.byDepartment.description'),
    },
  ]

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={2}>
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">{t('description')}</Text>
      </Flex>

      <RadioGroup
        label={t('title')}
        shouldVisuallyHideLabel
        options={scheduleTypeOptions}
        value={selectedType}
        onChange={onTypeChange}
      />

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backButton')}
        </Button>
        <Button onClick={onContinue}>{t('continueButton')}</Button>
      </ActionsLayout>
    </Flex>
  )
}
