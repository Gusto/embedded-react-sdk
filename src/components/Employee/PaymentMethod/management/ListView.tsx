import { useTranslation } from 'react-i18next'
import {
  usePaymentMethodList,
  type UsePaymentMethodListParams,
} from '../shared/usePaymentMethodList'
import { useDeleteBankAccount } from '../shared/useDeleteBankAccount'
import { DeleteBankAccountDialog } from '../shared/DeleteBankAccountDialog'
import { DataView, useDataView } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import PercentCircleIcon from '@/assets/icons/percent-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export function ListView({ employeeId, onEvent }: UsePaymentMethodListParams) {
  const { bankAccounts, paymentMethod, deletePendingBankAccountUuid, handleDelete } =
    usePaymentMethodList({ employeeId, onEvent })
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  const {
    pendingDeleteAccount,
    setPendingDeleteAccount,
    deletedAccountNumber,
    setDeletedAccountNumber,
    handleConfirmDelete,
  } = useDeleteBankAccount(handleDelete)

  const { ...dataViewProps } = useDataView({
    data: bankAccounts,
    columns: [
      {
        key: 'name',
        title: t('nicknameColumn'),
        render: bankAccount => (
          <Flex flexDirection="column" gap={0}>
            <Components.Text>{bankAccount.name}</Components.Text>
            <Components.Text variant="supporting">
              {bankAccount.hiddenAccountNumber}
            </Components.Text>
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
    <Flex gap={8} alignItems="center">
      {isDirectDeposit && bankAccounts.length > 1 && (
        <Components.Button
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.EMPLOYEE_SPLIT_PAYCHECK)
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
      <DeleteBankAccountDialog
        pendingDeleteAccount={pendingDeleteAccount}
        isPrimaryActionLoading={deletePendingBankAccountUuid === pendingDeleteAccount?.uuid}
        onClose={() => {
          setPendingDeleteAccount(null)
        }}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
      />
    </>
  )
}
