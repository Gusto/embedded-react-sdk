import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { usePaymentMethod, type UsePaymentMethodParams } from './usePaymentMethod'
import { ActionsLayout, DataView, useDataView } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { RadioGroupField } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
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

export function ListView({ employeeId, isAdmin, onEvent }: UsePaymentMethodParams) {
  const {
    formMethods,
    bankAccounts,
    paymentMethod,
    isPending,
    deletePendingBankAccountUuid,
    handlePaymentMethodTypeSubmit,
    handleDelete,
  } = usePaymentMethod({ employeeId, isAdmin, onEvent })
  const { handleSubmit, watch } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const format = useNumberFormatter(paymentMethod.splitBy === 'Amount' ? 'currency' : 'percent')
  const watchedType = watch('type')

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
