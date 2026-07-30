import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractorPaymentMethodSummary } from '../../shared/useContractorPaymentMethodSummary'
import { DataView, useDataView, Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, PAYMENT_METHODS, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

/**
 * Props for {@link PaymentMethodCard}.
 *
 * @public
 */
export interface PaymentMethodCardProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler fired on card interactions. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone "Payment" card showing a contractor's payment method.
 *
 * @remarks
 * Fetches its own data and emits the management block's scoped events when
 * the user clicks the card's CTAs or confirms removing the bank account. The
 * card has no alert API — alert rendering is the orchestrator's
 * responsibility.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/paymentMethod/card/addRequested` | Fired when the user clicks "Add bank account" | `{ contractorId: string }` |
 * | `contractor/management/paymentMethod/card/editRequested` | Fired when the user chooses "Edit" from the bank account row menu | `{ contractorId: string }` |
 * | `contractor/management/paymentMethod/card/removed` | Fired after the bank account is removed and the payment method reverts to Check | The updated `ContractorPaymentMethod` entity |
 *
 * @param props - See {@link PaymentMethodCardProps}.
 * @returns The "Payment" card.
 * @public
 */
export function PaymentMethodCard({ LoaderComponent, ...props }: PaymentMethodCardProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.PaymentMethod"
      LoaderComponent={LoaderComponent}
    >
      <PaymentMethodCardContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function PaymentMethodCardContent({
  contractorId,
  onEvent,
  LoaderComponent,
}: PaymentMethodCardProps) {
  useI18n('Contractor.Management.PaymentMethod')
  const { t } = useTranslation('Contractor.Management.PaymentMethod')
  const Components = useComponentContext()
  const summary = useContractorPaymentMethodSummary({ contractorId })
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  const isLoading = summary.isLoading
  const isDirectDeposit =
    !summary.isLoading && summary.data.paymentMethod.type === PAYMENT_METHODS.directDeposit
  const bankAccount = summary.isLoading ? undefined : summary.data.bankAccount

  const dataViewProps = useDataView({
    data: bankAccount ? [bankAccount] : [],
    columns: [
      {
        key: 'name',
        title: t('nicknameColumn'),
        render: account => (
          <>
            {account.name}
            <Components.Text variant="supporting" size="sm">
              {account.hiddenAccountNumber}
            </Components.Text>
          </>
        ),
      },
      { key: 'routingNumber', title: t('routingNumberColumn') },
      { key: 'accountType', title: t('accountTypeColumn') },
    ],
    itemMenu: () => (
      <HamburgerMenu
        items={[
          {
            label: t('editCta'),
            onClick: () => {
              onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_EDIT_REQUESTED, {
                contractorId,
              })
            },
          },
          {
            label: t('removeBankAccountCta'),
            onClick: () => {
              setIsRemoveDialogOpen(true)
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={t('hamburgerTitle')}
      />
    ),
  })

  const handleConfirmRemove = async () => {
    if (summary.isLoading) return
    const result = await summary.actions.onRemoveBankAccount()
    setIsRemoveDialogOpen(false)
    if (result) {
      onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_REMOVED, result.data)
    }
  }

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        withPadding={!isDirectDeposit}
        header={
          <Components.BoxHeader
            title={t('title')}
            action={
              !isDirectDeposit ? (
                <Components.Button
                  variant="secondary"
                  icon={<PlusCircleIcon />}
                  isDisabled={isLoading}
                  onClick={() => {
                    onEvent(
                      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
                      {
                        contractorId,
                      },
                    )
                  }}
                >
                  {t('addBankAccountCta')}
                </Components.Button>
              ) : undefined
            }
          />
        }
      >
        {isLoading ? (
          <Loading />
        ) : isDirectDeposit ? (
          <DataView label={t('bankAccountListLabel')} isWithinBox {...dataViewProps} />
        ) : (
          <Flex flexDirection="column" gap={0}>
            <Components.Text variant="supporting">{t('paymentMethodLabel')}</Components.Text>
            <Components.Text>{t('checkLabel')}</Components.Text>
          </Flex>
        )}
      </Components.Box>
      <Components.Dialog
        isOpen={isRemoveDialogOpen}
        onClose={() => {
          setIsRemoveDialogOpen(false)
        }}
        onPrimaryActionClick={() => {
          void handleConfirmRemove()
        }}
        isDestructive
        isPrimaryActionLoading={!summary.isLoading && summary.status.isPending}
        title={t('removeBankAccountDialog.title')}
        primaryActionLabel={t('removeBankAccountDialog.confirmCta')}
        closeActionLabel={t('removeBankAccountDialog.cancelCta')}
      >
        <Components.Text>
          {t('removeBankAccountDialog.description', {
            account: bankAccount?.hiddenAccountNumber ?? '',
          })}
        </Components.Text>
      </Components.Dialog>
    </BaseLayout>
  )
}
