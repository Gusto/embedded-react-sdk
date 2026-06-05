import { useTranslation } from 'react-i18next'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import { useDeductionsList } from '../../shared/useDeductionsList'
import { useDeleteDeduction } from '../../shared/useDeleteDeduction'
import { DeleteDeductionDialog } from '../../shared/DeleteDeductionDialog'
import { formatDeductionAmount } from '../../shared/formatDeductionAmount'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

export interface DeductionsCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Deductions" management card. Owns its own data fetch via
 * `useDeductionsList`, plus the delete confirm dialog, and emits
 * `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED` /
 * `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED` /
 * `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED` events. The card has no
 * alert API — alert rendering is the orchestrator's responsibility (block's
 * `DeductionsCardContextual` for standalone consumption, dashboard chrome
 * for dashboard consumption).
 */
export function DeductionsCard(props: DeductionsCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.Deductions">
      <DeductionsCardContent {...props} />
    </BaseBoundaries>
  )
}

function DeductionsCardContent({ employeeId, onEvent }: DeductionsCardProps) {
  useI18n('Employee.Management.Deductions')
  const { t } = useTranslation('Employee.Management.Deductions')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')

  const deductionsList = useDeductionsList({ employeeId })

  const {
    pendingDeleteDeduction,
    setPendingDeleteDeduction,
    handleConfirmDelete: handleConfirmDeleteDeduction,
  } = useDeleteDeduction(async garnishment => {
    if (deductionsList.isLoading) return
    const result = await deductionsList.actions.onDelete(garnishment)
    if (result) {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED, result.data.garnishment)
    }
  })

  // `useDeductionsList` returns `isLoading: true` even when the query has
  // errored and `data` is missing. Treat those rows as "not loading" so the
  // section doesn't show a perpetual skeleton while BaseLayout already
  // renders the error alert.
  const isDeductionsLoading =
    deductionsList.isLoading && deductionsList.errorHandling.errors.length === 0

  const deductions = deductionsList.isLoading ? [] : deductionsList.data.deductions
  const deletingGarnishmentUuid = deductionsList.isLoading
    ? undefined
    : deductionsList.status.deletingGarnishmentUuid

  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED, { employeeId })
  }
  const handleEdit = (garnishment: Garnishment) => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED, garnishment)
  }

  const garnishmentsColumns = [
    {
      key: 'description',
      title: t('columns.deduction'),
      render: (garnishment: Garnishment) => garnishment.description || '-',
    },
    {
      key: 'frequency',
      title: t('columns.frequency'),
      render: (garnishment: Garnishment) => (garnishment.recurring ? t('recurring') : t('oneTime')),
    },
    {
      key: 'amount',
      title: t('columns.withhold'),
      render: (garnishment: Garnishment) =>
        formatDeductionAmount(garnishment, {
          formatCurrency,
          formatPercent,
          formatPerPaycheck: (value: string) => t('amountPerPaycheck', { value }),
        }),
    },
  ]

  const garnishmentsDataView = useDataView({
    data: deductions,
    columns: garnishmentsColumns,
    itemMenu: (garnishment: Garnishment) => (
      <HamburgerMenu
        isLoading={deletingGarnishmentUuid === garnishment.uuid}
        items={[
          {
            label: t('editCta'),
            onClick: () => {
              handleEdit(garnishment)
            },
            icon: <PencilSvg aria-hidden />,
          },
          {
            label: t('deleteCta'),
            onClick: () => {
              setPendingDeleteDeduction(garnishment)
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={t('hamburgerTitle')}
      />
    ),
    emptyState: () => (
      <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
    ),
  })

  return (
    <BaseLayout error={deductionsList.errorHandling.errors}>
      <Components.Box
        withPadding={false}
        header={
          <Components.BoxHeader
            title={t('title')}
            action={
              <Components.Button variant="secondary" onClick={handleAdd} icon={<PlusCircleIcon />}>
                {t('addDeductionCta')}
              </Components.Button>
            }
          />
        }
      >
        {isDeductionsLoading ? (
          <Loading />
        ) : (
          <DataView label={t('listLabel')} isWithinBox {...garnishmentsDataView} />
        )}
      </Components.Box>

      <DeleteDeductionDialog
        pendingDeleteDeduction={pendingDeleteDeduction}
        isPrimaryActionLoading={deletingGarnishmentUuid === pendingDeleteDeduction?.uuid}
        onClose={() => {
          setPendingDeleteDeduction(null)
        }}
        onConfirm={() => {
          void handleConfirmDeleteDeduction()
        }}
        title={t('deleteDeductionDialog.title')}
        description={t('deleteDeductionDialog.description', {
          deduction: pendingDeleteDeduction?.description ?? '',
        })}
        confirmLabel={t('deleteDeductionDialog.confirmCta')}
        cancelLabel={t('deleteDeductionDialog.cancelCta')}
      />
    </BaseLayout>
  )
}
