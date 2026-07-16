import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import {
  usePaymentMethodList,
  type UsePaymentMethodListReady,
} from '../shared/usePaymentMethodList'
import {
  usePaymentMethodForm,
  type PaymentMethodType,
  type UsePaymentMethodFormReady,
} from '../shared/usePaymentMethodForm'
import { useDeleteBankAccount } from '../shared/useDeleteBankAccount'
import { DeleteBankAccountDialog } from '../shared/DeleteBankAccountDialog'
import { BankFormBody } from '../shared/BankFormBody'
import { useOnboardingBankFormDictionary } from './useFormDictionary'
import styles from './ListView.module.scss'
import { ActionsLayout, DataView, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { centsToDollars } from '@/helpers/currencyHelpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { Flex } from '@/components/Common/Flex/Flex'

interface ListViewProps {
  employeeId: string
  isAdmin: boolean
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
export function ListView({ employeeId, isAdmin, onEvent }: ListViewProps) {
  const paymentMethodList = usePaymentMethodList({ employeeId })
  const paymentMethodForm = usePaymentMethodForm({ employeeId })

  const errorHandling = composeErrorHandler([paymentMethodList, paymentMethodForm])

  if (paymentMethodList.isLoading || paymentMethodForm.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  return (
    <ListViewReady
      employeeId={employeeId}
      isAdmin={isAdmin}
      onEvent={onEvent}
      paymentMethodList={paymentMethodList}
      paymentMethodForm={paymentMethodForm}
      errorHandling={errorHandling}
    />
  )
}

interface ListViewReadyProps extends ListViewProps {
  paymentMethodList: UsePaymentMethodListReady
  paymentMethodForm: UsePaymentMethodFormReady
  errorHandling: ReturnType<typeof composeErrorHandler>
}

function ListViewReady({
  employeeId,
  isAdmin,
  onEvent,
  paymentMethodList,
  paymentMethodForm,
  errorHandling,
}: ListViewReadyProps) {
  const { paymentMethod, bankAccounts } = paymentMethodList.data
  const { deletePendingBankAccountUuid } = paymentMethodList.status
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const format = useNumberFormatter(paymentMethod.splitBy === 'Amount' ? 'currency' : 'percent')
  const dictionary = useOnboardingBankFormDictionary()

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
  } = useDeleteBankAccount(async uuid => {
    const result = await paymentMethodList.actions.onDelete(uuid)
    if (result) {
      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, result.data)
    }
  })

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

  const handleContinue = async () => {
    const result = await paymentMethodForm.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, result.data)
      onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
    }
  }

  const showInlineBankForm =
    watchedType === PAYMENT_METHODS.directDeposit && bankAccounts.length === 0
  const showContinue = watchedType === PAYMENT_METHODS.check || bankAccounts.length > 0

  const footer =
    watchedType === PAYMENT_METHODS.directDeposit && bankAccounts.length > 0 ? (
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
        <Components.Button
          variant="secondary"
          type="button"
          onClick={() => {
            onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE)
          }}
        >
          {t('addAnotherCta')}
        </Components.Button>
      </ActionsLayout>
    ) : undefined

  return (
    <>
      <BaseLayout error={errorHandling.errors}>
        <SDKFormProvider formHookResult={paymentMethodForm}>
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
          <Flex flexDirection="column" gap={20}>
            <Components.FormBox
              header={<Components.FormBoxHeader title={t('title')} />}
              withPadding={false}
              footer={footer}
            >
              <div className={styles.section}>
                <Fields.Type
                  label={t('paymentFieldsetLegend')}
                  getOptionLabel={(value: PaymentMethodType) =>
                    value === PAYMENT_METHODS.directDeposit
                      ? t('directDepositLabel')
                      : t('checkLabel')
                  }
                  FieldComponent={TypeFieldComponent}
                />
              </div>
              {watchedType === PAYMENT_METHODS.directDeposit && bankAccounts.length > 0 && (
                <DataView isWithinBox label={t('bankAccountsListLabel')} {...dataViewProps} />
              )}
              {showInlineBankForm && (
                <div className={styles.section}>
                  <BankFormBody
                    employeeId={employeeId}
                    dictionary={dictionary}
                    onSaved={data => {
                      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, data)
                    }}
                  />
                </div>
              )}
            </Components.FormBox>
            {showContinue && (
              <ActionsLayout>
                <Components.Button
                  type="button"
                  isLoading={paymentMethodForm.status.isPending}
                  onClick={() => {
                    void handleContinue()
                  }}
                >
                  {t('submitCta')}
                </Components.Button>
              </ActionsLayout>
            )}
          </Flex>
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
