import { useTranslation } from 'react-i18next'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { Type as PayScheduleAssignmentType } from '@gusto/embedded-api/models/components/payscheduleassignment'
import type { PayScheduleCardData } from './ManagePayScheduleLanding'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common'

interface ManagePayScheduleLandingPresentationProps {
  assignmentType: PayScheduleAssignmentType | null | undefined
  payScheduleCards: PayScheduleCardData[]
  onManage: () => void
  onEdit: (paySchedule: PayScheduleObject) => void
  onPreviewPaydays: (paySchedule: PayScheduleObject) => void
  successAlert?: { messageKey: 'assignmentsUpdated' | 'scheduleUpdated' }
}

export function ManagePayScheduleLandingPresentation({
  assignmentType,
  payScheduleCards,
  onManage,
  onEdit,
  onPreviewPaydays,
  successAlert,
}: ManagePayScheduleLandingPresentationProps) {
  useI18n('CompanyManagement.ManagePayScheduleLanding')
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleLanding')
  const { Heading, Text, Card, Button, Alert } = useComponentContext()

  const getAssignmentTypeDescription = () => {
    switch (assignmentType) {
      case 'single':
        return t('assignmentDescriptions.single')
      case 'hourly_salaried':
        return t('assignmentDescriptions.hourlySalaried')
      case 'by_employee':
        return t('assignmentDescriptions.byEmployee')
      case 'by_department':
        return t('assignmentDescriptions.byDepartment')
      default:
        return t('assignmentDescriptions.single')
    }
  }

  const getSuccessMessage = () => {
    if (!successAlert) return ''
    switch (successAlert.messageKey) {
      case 'assignmentsUpdated':
        return t('successMessages.assignmentsUpdated')
      case 'scheduleUpdated':
        return t('successMessages.scheduleUpdated')
      default:
        return ''
    }
  }

  return (
    <Flex flexDirection="column" gap={24}>
      {successAlert && <Alert status="success" label={getSuccessMessage()} />}
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('payScheduleLabel')}</Heading>
          <Text variant="supporting">{getAssignmentTypeDescription()}</Text>
        </Flex>
        <Button variant="secondary" onClick={onManage}>
          {t('manageLink')}
        </Button>
      </Flex>

      <Flex flexDirection="column" gap={2}>
        {payScheduleCards.map(card => (
          <Card key={card.paySchedule.uuid}>
            <Heading as="h3">{card.title}</Heading>

            <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <Flex flexDirection="column" gap={4}>
                <Text weight="medium">{t('payFrequencyLabel')}</Text>
                <Text variant="supporting">
                  {card.frequency}
                  {card.customName && ` - ${card.customName}`}
                </Text>
              </Flex>
              <Button
                variant="secondary"
                onClick={() => {
                  onEdit(card.paySchedule)
                }}
              >
                {t('editLink')}
              </Button>
            </Flex>

            {/*<Button
              variant="secondary"
              onClick={() => {
                onPreviewPaydays(card.paySchedule)
              }}
            >
              {t('previewUpcomingPaydays')}
            </Button>*/}
          </Card>
        ))}
      </Flex>
    </Flex>
  )
}
