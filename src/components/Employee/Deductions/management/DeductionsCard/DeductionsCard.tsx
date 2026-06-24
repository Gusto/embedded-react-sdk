import { useTranslation } from 'react-i18next'
import type { Garnishment } from '@gusto/embedded-api-v-2026-02-01/models/components/garnishment'
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

/**
 * Props for {@link DeductionsCard}.
 *
 * @public
 */
export interface DeductionsCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Callback invoked when the card emits an event. See the events table on {@link DeductionsCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone read-only card listing an employee's active deductions, with affordances to add, edit, or delete a deduction.
 *
 * @remarks
 * Fetches its own data and owns the delete confirm dialog. Has no alert API — alert rendering is the consumer's responsibility. Add and edit affordances do not open a form themselves; emit-then-route is the contract, so the consumer listens for the `addRequested` / `editRequested` events and renders {@link DeductionsEditForm} (or its own equivalent) accordingly. For an orchestrated card-plus-form flow, use {@link Deductions} instead.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/deductions/card/addRequested` | Fired when the "Add deduction" CTA is clicked | `{ employeeId: string }` |
 * | `employee/management/deductions/card/editRequested` | Fired when an "Edit" CTA is clicked for a deduction | The matching `Garnishment` |
 * | `employee/management/deductions/card/deleted` | Fired after a deduction is deleted via the confirm dialog | The deleted `Garnishment` |
 *
 * @param props - See {@link DeductionsCardProps}.
 * @returns The rendered deductions card.
 * @public
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
