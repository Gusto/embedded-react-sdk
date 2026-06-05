import { useTranslation } from 'react-i18next'
import type { PendingCompensationChange } from './getPendingCompensationChanges'
import { usePendingChangeDetailRenderer } from './usePendingChangeDetailRenderer'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'

export interface PendingChangesReviewModalProps {
  isOpen: boolean
  pendingChanges: PendingCompensationChange[]
  employeeFirstName: string | null | undefined
  cancellingCompensationUuid: string | null
  onClose: () => void
  onCancelChange: (pendingChange: PendingCompensationChange) => void
}

export function PendingChangesReviewModal({
  isOpen,
  pendingChanges,
  employeeFirstName,
  cancellingCompensationUuid,
  onClose,
  onCancelChange,
}: PendingChangesReviewModalProps) {
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()
  const renderDetail = usePendingChangeDetailRenderer(employeeFirstName)

  return (
    <Components.Modal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnBackdropClick
      footer={
        <Flex justifyContent="flex-end" gap={8}>
          <Components.Button variant="secondary" onClick={onClose}>
            {t('card.pendingChange.modal.closeCta')}
          </Components.Button>
        </Flex>
      }
    >
      <Flex flexDirection="column" gap={32}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h3" styledAs="h4">
            {t('card.pendingChange.modal.title')}
          </Components.Heading>
          <Components.Text variant="supporting">
            {t('card.pendingChange.modal.description')}
          </Components.Text>
        </Flex>
        <Flex flexDirection="column" gap={16}>
          {pendingChanges.map(change => (
            <Components.Box
              key={change.compensationUuid}
              footer={
                <Components.Button
                  variant="secondary"
                  isLoading={cancellingCompensationUuid === change.compensationUuid}
                  onClick={() => {
                    onCancelChange(change)
                  }}
                >
                  {t('card.pendingChange.cancelCta')}
                </Components.Button>
              }
            >
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={0}>
                  {change.jobTitle && (
                    <Components.Text weight="medium">{change.jobTitle}</Components.Text>
                  )}
                  <Components.Text variant="supporting" size="sm">
                    {formatDateLongWithYear(change.effectiveDate)}
                  </Components.Text>
                </Flex>
                <Components.UnorderedList
                  items={change.details.map(detail => renderDetail(detail))}
                />
              </Flex>
            </Components.Box>
          ))}
        </Flex>
      </Flex>
    </Components.Modal>
  )
}
