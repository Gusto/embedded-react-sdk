import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePaymentMethod, type UsePaymentMethodParams } from './usePaymentMethod'
import { DataView, useDataView } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import PercentCircleIcon from '@/assets/icons/percent-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export function ManagementListView({ employeeId, isAdmin, onEvent }: UsePaymentMethodParams) {
  const { bankAccounts, paymentMethod, deletePendingBankAccountUuid, handleDelete } =
    usePaymentMethod({ employeeId, isAdmin, onEvent })
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<{
    uuid: string
    hiddenAccountNumber: string | undefined
  } | null>(null)
  const [deletedAccountNumber, setDeletedAccountNumber] = useState<string | null>(null)

  const handleConfirmDelete = async () => {
    if (!pendingDeleteAccount) return
    const { uuid, hiddenAccountNumber } = pendingDeleteAccount
    await handleDelete(uuid)
    setPendingDeleteAccount(null)
    setDeletedAccountNumber(hiddenAccountNumber ?? '')
  }

  const { ...dataViewProps } = useDataView({
    data: bankAccounts,
    columns: [
      {
        key: 'name',
        title: t('nicknameColumn'),
        render: bankAccount => (
          <Flex flexDirection="column" gap={0}>
            <Components.Text>{bankAccount.name}</Components.Text>
            <Components.Text variant="supporting">{bankAccount.hiddenAccountNumber}</Components.Text>
          </Flex>
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
    <Flex gap={8} alignItems="flex-end">
      {isDirectDeposit && bankAccounts.length > 1 && (
        <Components.Button
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.EMPLOYEE_SPLIT_PAYMENT)
          }}
          icon={<PercentCircleIcon />}
        >
          {t('splitCta')}
        </Components.Button>
      )}
      <Components.Button
        variant="secondary"
        onClick={() => {
          onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE)
        }}
        icon={<PlusCircleIcon />}
      >
        {bankAccounts.length > 0 ? t('addAnotherCta') : t('addBankAccountCta')}
      </Components.Button>
    </Flex>
  )

  return (
    <>
      <Components.Box
        header={<Components.BoxHeader title={t('managementTitle')} action={headerAction} />}
      >
        {deletedAccountNumber !== null && (
          <Components.Alert
            status="success"
            label={t('deleteBankAccountSuccessAlert', { account: deletedAccountNumber })}
            onDismiss={() => {
              setDeletedAccountNumber(null)
            }}
            disableScrollIntoView
          />
        )}
        {isDirectDeposit && bankAccounts.length > 0 ? (
          <DataView label={t('bankAccountsListLabel')} {...dataViewProps} />
        ) : (
          <Flex flexDirection="column" gap={0}>
            <Components.Text variant="supporting">{t('paymentMethodLabel')}</Components.Text>
            <Components.Text>
              {isDirectDeposit ? t('directDepositLabel') : t('checkLabel')}
            </Components.Text>
          </Flex>
        )}
      </Components.Box>
      <Components.Dialog
        isOpen={pendingDeleteAccount !== null}
        onClose={() => {
          setPendingDeleteAccount(null)
        }}
        onPrimaryActionClick={() => {
          void handleConfirmDelete()
        }}
        isPrimaryActionLoading={deletePendingBankAccountUuid === pendingDeleteAccount?.uuid}
        isDestructive
        title={t('deleteBankAccountDialog.title')}
        primaryActionLabel={t('deleteBankAccountDialog.confirmCta')}
        closeActionLabel={t('deleteBankAccountDialog.cancelCta')}
      >
        {pendingDeleteAccount &&
          t('deleteBankAccountDialog.description', {
            account: pendingDeleteAccount.hiddenAccountNumber ?? '',
          })}
      </Components.Dialog>
    </>
  )
}
