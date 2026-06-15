import { useTranslation } from 'react-i18next'
import {
  usePaymentMethodList,
  type UsePaymentMethodListReady,
} from '../shared/usePaymentMethodList'
import { useDeleteBankAccount } from '../shared/useDeleteBankAccount'
import { DeleteBankAccountDialog } from '../shared/DeleteBankAccountDialog'
import styles from './PaymentMethodCard.module.scss'
import { DataView, useDataView, Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, PAYMENT_METHODS, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import PercentCircleIcon from '@/assets/icons/percent-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

/**
 * Props for {@link PaymentMethodCard}.
 *
 * @public
 */
export interface PaymentMethodCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on card interactions. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Payment" card.
 *
 * @remarks
 * Owns its own data fetch and emits the management block's scoped events
 * when the user clicks the card's CTAs or confirms a bank-account deletion.
 * The card has no alert API — alert rendering is the orchestrator's
 * responsibility.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/paymentMethod/card/addRequested` | Fired when the user clicks the add-account CTA | — |
 * | `employee/management/paymentMethod/card/splitRequested` | Fired when the user clicks the split-paycheck CTA | — |
 * | `employee/management/paymentMethod/card/bankAccountDeleted` | Fired after a bank account is successfully deleted | The delete response payload |
 *
 * @param props - See {@link PaymentMethodCardProps}.
 * @returns The "Payment" card.
 * @public
 */
export function PaymentMethodCard(props: PaymentMethodCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.PaymentMethod">
      <PaymentMethodCardContent {...props} />
    </BaseBoundaries>
  )
}

function PaymentMethodCardContent({ employeeId, onEvent }: PaymentMethodCardProps) {
  useI18n('Employee.Management.PaymentMethod')
  const { t } = useTranslation('Employee.Management.PaymentMethod')
  const Components = useComponentContext()
  const paymentMethodList = usePaymentMethodList({ employeeId })

  const errorHandling = composeErrorHandler([paymentMethodList])

  if (paymentMethodList.isLoading) {
    return (
      <BaseLayout error={errorHandling.errors}>
        <Components.Box
          header={
            <Components.BoxHeader
              title={t('title')}
              action={
                <div className={styles.headerAction}>
                  <Components.Button variant="secondary" icon={<PlusCircleIcon />} isDisabled>
                    {t('addBankAccountCta')}
                  </Components.Button>
                </div>
              }
            />
          }
        >
          <Loading />
        </Components.Box>
      </BaseLayout>
    )
  }

  return (
    <PaymentMethodCardReady
      employeeId={employeeId}
      onEvent={onEvent}
      paymentMethodList={paymentMethodList}
      errorHandling={errorHandling}
    />
  )
}

interface PaymentMethodCardReadyProps extends PaymentMethodCardProps {
  paymentMethodList: UsePaymentMethodListReady
  errorHandling: ReturnType<typeof composeErrorHandler>
}

function PaymentMethodCardReady({
  onEvent,
  paymentMethodList,
  errorHandling,
}: PaymentMethodCardReadyProps) {
  const { paymentMethod, bankAccounts } = paymentMethodList.data
  const { deletePendingBankAccountUuid } = paymentMethodList.status
  const { t } = useTranslation('Employee.Management.PaymentMethod')
  const Components = useComponentContext()

  const { pendingDeleteAccount, setPendingDeleteAccount, handleConfirmDelete } =
    useDeleteBankAccount(async uuid => {
      const result = await paymentMethodList.actions.onDelete(uuid)
      if (result) {
        onEvent(
          componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED,
          result.data,
        )
      }
    })

  const { ...dataViewProps } = useDataView({
    data: bankAccounts,
    columns: [
      {
        key: 'name',
        title: t('nicknameColumn'),
        render: bankAccount => (
          <>
            {bankAccount.name}
            <Components.Text variant="supporting" size="sm">
              {bankAccount.hiddenAccountNumber}
            </Components.Text>
          </>
        ),
      },
      { key: 'routingNumber', title: t('routingNumberColumn') },
      { key: 'accountType', title: t('accountTypeColumn') },
    ],
    itemMenu: bankAccount => (
      <HamburgerMenu
        items={[
          {
            label: t('deleteBankAccountCta'),
            onClick: () => {
              setPendingDeleteAccount({
                uuid: bankAccount.uuid,
                hiddenAccountNumber: bankAccount.hiddenAccountNumber,
              })
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={t('hamburgerTitle')}
      />
    ),
  })

  const isDirectDeposit = paymentMethod.type === PAYMENT_METHODS.directDeposit

  const headerAction = (
    <div className={styles.headerAction}>
      {isDirectDeposit && bankAccounts.length > 1 && (
        <Components.Button
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED)
          }}
          icon={<PercentCircleIcon />}
        >
          {t('splitCta')}
        </Components.Button>
      )}
      <Components.Button
        variant="secondary"
        onClick={() => {
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED)
        }}
        icon={<PlusCircleIcon />}
      >
        {bankAccounts.length > 0 ? t('addAnotherCta') : t('addBankAccountCta')}
      </Components.Button>
    </div>
  )

  const isShowingBankAccountTable = isDirectDeposit && bankAccounts.length > 0

  return (
    <>
      <BaseLayout error={errorHandling.errors}>
        <Components.Box
          withPadding={!isShowingBankAccountTable}
          header={<Components.BoxHeader title={t('title')} action={headerAction} />}
        >
          {isShowingBankAccountTable ? (
            <DataView label={t('bankAccountsListLabel')} isWithinBox {...dataViewProps} />
          ) : (
            <Flex flexDirection="column" gap={0}>
              <Components.Text variant="supporting">{t('paymentMethodLabel')}</Components.Text>
              <Components.Text>
                {isDirectDeposit ? t('directDepositLabel') : t('checkLabel')}
              </Components.Text>
            </Flex>
          )}
        </Components.Box>
      </BaseLayout>
      <DeleteBankAccountDialog
        pendingDeleteAccount={pendingDeleteAccount}
        isPrimaryActionLoading={deletePendingBankAccountUuid === pendingDeleteAccount?.uuid}
        onClose={() => {
          setPendingDeleteAccount(null)
        }}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
        title={t('deleteBankAccountDialog.title')}
        description={t('deleteBankAccountDialog.description', {
          account: pendingDeleteAccount?.hiddenAccountNumber ?? '',
        })}
        confirmLabel={t('deleteBankAccountDialog.confirmCta')}
        cancelLabel={t('deleteBankAccountDialog.cancelCta')}
      />
    </>
  )
}
