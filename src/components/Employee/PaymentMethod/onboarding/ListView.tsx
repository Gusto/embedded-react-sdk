import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import {
  usePaymentMethodList,
  type UsePaymentMethodListParams,
} from '../shared/usePaymentMethodList'
import {
  usePaymentMethodForm,
  type PaymentMethodType,
  type UsePaymentMethodFormReady,
} from '../shared/usePaymentMethodForm'
import { useDeleteBankAccount } from '../shared/useDeleteBankAccount'
import { DeleteBankAccountDialog } from '../shared/DeleteBankAccountDialog'
import { ActionsLayout, DataView, useDataView } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useBase } from '@/components/Base/useBase'
import { centsToDollars } from '@/helpers/currencyHelpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export function ListView({
  employeeId,
  isAdmin,
  onEvent,
}: UsePaymentMethodListParams & { isAdmin: boolean }) {
  const paymentMethodForm = usePaymentMethodForm({ employeeId })

  if (paymentMethodForm.isLoading) {
    return <BaseLayout isLoading error={paymentMethodForm.errorHandling.errors} />
  }

  return (
    <ListViewReady
      employeeId={employeeId}
      isAdmin={isAdmin}
      onEvent={onEvent}
      paymentMethodForm={paymentMethodForm}
    />
  )
}

interface ListViewReadyProps extends UsePaymentMethodListParams {
  isAdmin: boolean
  paymentMethodForm: UsePaymentMethodFormReady
}

function ListViewReady({ employeeId, isAdmin, onEvent, paymentMethodForm }: ListViewReadyProps) {
  const { baseSubmitHandler } = useBase()
  const { paymentMethod, bankAccounts, deletePendingBankAccountUuid, handleDelete } =
    usePaymentMethodList({ employeeId, onEvent })
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const format = useNumberFormatter(paymentMethod.splitBy === 'Amount' ? 'currency' : 'percent')

  const { Fields } = paymentMethodForm.form
  const watchedType = useWatch({
    control: paymentMethodForm.form.hookFormInternals.formMethods.control,
    name: 'type',
  })

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

  const TypeFieldComponent = (props: RadioGroupProps) => (
    <Components.RadioGroup
      {...props}
      options={props.options.map(option => ({
        ...option,
        description:
          option.value === PAYMENT_METHODS.directDeposit
            ? isAdmin
              ? t('directDepositDescription')
              : t('directDepositDescriptionSelf')
            : isAdmin
              ? t('checkDescription')
              : t('checkDescriptionSelf'),
      }))}
    />
  )

  const handleSubmit = async () => {
    const result = await paymentMethodForm.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, result.data)
      onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
    }
  }

  return (
    <>
      <BaseLayout error={paymentMethodForm.errorHandling.errors}>
        <SDKFormProvider formHookResult={paymentMethodForm}>
          <Form onSubmit={handleSubmit}>
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
            <Fields.Type
              label={t('paymentFieldsetLegend')}
              getOptionLabel={(value: PaymentMethodType) =>
                value === PAYMENT_METHODS.directDeposit ? t('directDepositLabel') : t('checkLabel')
              }
              FieldComponent={TypeFieldComponent}
            />
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
              <Components.Button type="submit" isLoading={paymentMethodForm.status.isPending}>
                {t('submitCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
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
      />
    </>
  )
}
