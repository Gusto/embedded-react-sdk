import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  usePaymentMethodList,
  type UsePaymentMethodListParams,
} from '../shared/usePaymentMethodList'
import { usePaymentMethodForm } from '../shared/usePaymentMethodForm'
import { useDeleteBankAccount } from '../shared/useDeleteBankAccount'
import { DeleteBankAccountDialog } from '../shared/DeleteBankAccountDialog'
import { ActionsLayout, DataView, useDataView } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { RadioGroupField } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useBase } from '@/components/Base/useBase'
import { centsToDollars } from '@/helpers/currencyHelpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

function PaymentTypeRadio({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <RadioGroupField
      name="type"
      label={t('paymentFieldsetLegend')}
      shouldVisuallyHideLabel
      options={[
        {
          value: PAYMENT_METHODS.directDeposit,
          label: t('directDepositLabel'),
          description: isAdmin ? t('directDepositDescription') : t('directDepositDescriptionSelf'),
        },
        {
          value: PAYMENT_METHODS.check,
          label: t('checkLabel'),
          description: isAdmin ? t('checkDescription') : t('checkDescriptionSelf'),
        },
      ]}
    />
  )
}

export function ListView({
  employeeId,
  isAdmin,
  onEvent,
}: UsePaymentMethodListParams & { isAdmin: boolean }) {
  const { baseSubmitHandler } = useBase()
  const { paymentMethod, bankAccounts, deletePendingBankAccountUuid, handleDelete } =
    usePaymentMethodList({ employeeId, onEvent })
  const { formMethods, isPending, handlePaymentMethodTypeSubmit } = usePaymentMethodForm({
    employeeId,
    onEvent,
  })
  const { handleSubmit, watch } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const format = useNumberFormatter(paymentMethod.splitBy === 'Amount' ? 'currency' : 'percent')
  const watchedType = watch('type')

  const {
    pendingDeleteAccount,
    setPendingDeleteAccount,
    deletedAccountNumber,
    setDeletedAccountNumber,
    handleConfirmDelete,
  } = useDeleteBankAccount(uuid => baseSubmitHandler(uuid, handleDelete))

  const { ...dataViewProps } = useDataView({
    data: bankAccounts,
    columns: [
      { key: 'name', title: t('nicknameColumn') },
      { key: 'routingNumber', title: t('routingNumberColumn') },
      { key: 'accountType', title: t('accountTypeColumn') },
      {
        key: 'splitAmount',
        title: t('allocationColumn'),
        render: bankAccount => {
          const splitAmount =
            paymentMethod.splits?.find(split => split.uuid === bankAccount.uuid)?.splitAmount ?? 0
          const displayValue =
            paymentMethod.splitBy === SPLIT_BY.amount
              ? (centsToDollars(splitAmount) ?? 0)
              : splitAmount
          return format(displayValue)
        },
      },
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

  return (
    <>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(handlePaymentMethodTypeSubmit)}>
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
          <Components.Heading as="h2">{t('title')}</Components.Heading>
          <PaymentTypeRadio isAdmin={isAdmin} />
          {bankAccounts.length > 0 && (
            <DataView label={t('bankAccountsListLabel')} {...dataViewProps} />
          )}
          <ActionsLayout>
            {bankAccounts.length > 1 && (
              <Components.Button
                variant="secondary"
                type="button"
                onClick={() => {
                  onEvent(componentEvents.EMPLOYEE_SPLIT_PAYMENT)
                }}
              >
                {t('splitCta')}
              </Components.Button>
            )}
            {watchedType === PAYMENT_METHODS.directDeposit && (
              <Components.Button
                variant="secondary"
                type="button"
                onClick={() => {
                  onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE)
                }}
              >
                {bankAccounts.length > 0 ? t('addAnotherCta') : t('addBankAccountCta')}
              </Components.Button>
            )}
            <Components.Button type="submit" isLoading={isPending}>
              {t('submitCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </FormProvider>
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
