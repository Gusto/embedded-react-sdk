import { useEffect, useMemo } from 'react'
import { FormProvider, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { Trans, useTranslation } from 'react-i18next'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import DOMPurify from 'dompurify'
import { usePaymentMethod } from './usePaymentMethod'
import type { CombinedSchemaInputs } from './paymentMethodSchema'
import { ActionsLayout, DataView, useDataView } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import {
  NumberInputField,
  RadioGroupField,
  TextInputField,
} from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { useFlow } from '@/components/Flow/useFlow'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { centsToDollars } from '@/helpers/currencyHelpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export interface PaymentMethodContextInterface extends FlowContextInterface {
  employeeId: string
  isAdmin: boolean
}

type Split = NonNullable<EmployeePaymentMethod['splits']>[number]

// --- Shared helpers ---

function BankAccountFormFields() {
  const { t } = useTranslation('Employee.PaymentMethod')
  const { setValue } = useFormContext<CombinedSchemaInputs>()
  setValue('hasBankPayload', true)

  return (
    <>
      <TextInputField
        name="name"
        isRequired
        label={t('nameLabel')}
        errorMessage={t('validations.accountName')}
      />
      <TextInputField
        name="routingNumber"
        label={t('routingNumberLabel')}
        isRequired
        description={t('routingNumberDescription')}
        errorMessage={t('validations.routingNumber')}
      />
      <TextInputField
        name="accountNumber"
        label={t('accountNumberLabel')}
        errorMessage={t('validations.accountNumber')}
        isRequired
      />
      <RadioGroupField
        name="accountType"
        isRequired
        label={t('accountTypeLabel')}
        options={[
          { value: 'Checking', label: t('accountTypeChecking') },
          { value: 'Savings', label: t('accountTypeSavings') },
        ]}
      />
    </>
  )
}

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

// --- Contextual view components ---

export function ListViewContextual() {
  const { employeeId, isAdmin, onEvent } = useFlow<PaymentMethodContextInterface>()
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
              void handleDelete(bankAccount.uuid)
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={t('hamburgerTitle')}
        isLoading={deletePendingBankAccountUuid === bankAccount.uuid}
      />
    ),
  })

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handlePaymentMethodTypeSubmit)}>
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
  )
}

export function BankFormContextual() {
  const { employeeId, isAdmin, onEvent } = useFlow<PaymentMethodContextInterface>()
  const { formMethods, isPending, handleBankAccountSubmit, resetToDefaults } =
    usePaymentMethod({ employeeId, isAdmin, onEvent })
  const { handleSubmit, setValue } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  // Bank form is always Direct Deposit — force the type so the submit handler validates correctly
  setValue('type', PAYMENT_METHODS.directDeposit)

  const handleCancel = () => {
    resetToDefaults()
    onEvent(componentEvents.CANCEL)
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handleBankAccountSubmit)}>
        <BankAccountFormFields />
        <ActionsLayout>
          <Components.Button variant="secondary" type="button" onClick={handleCancel}>
            {t('cancelAddCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      </Form>
    </FormProvider>
  )
}

export function SplitViewContextual() {
  const { employeeId, isAdmin, onEvent } = useFlow<PaymentMethodContextInterface>()
  const { formMethods, paymentMethod, bankAccounts, isPending, handleSplitSubmit, resetToDefaults } =
    usePaymentMethod({ employeeId, isAdmin, onEvent })
  const {
    handleSubmit,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const splitBy = watch('splitBy')
  const priorities = watch('priority')

  const splits = useMemo(() => paymentMethod.splits ?? [], [paymentMethod.splits])

  const remainderId = Object.entries(priorities).reduce(
    (maxId, [uuid, priority]) => (!maxId || (priorities[maxId] ?? 0) < priority ? uuid : maxId),
    '',
  )

  useEffect(() => {
    if (!splits.length) return
    if (splitBy === SPLIT_BY.amount) {
      const newValues = splits.reduce<Record<string, number | null>>((acc, curr) => {
        acc[curr.uuid] = curr.uuid === remainderId ? null : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    } else {
      const newValues = splits.reduce<Record<string, number>>((acc, curr, index) => {
        acc[curr.uuid] = index === 0 ? 100 : 0
        return acc
      }, {})
      setValue('splitAmount', newValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitBy])

  const updateSplitAmount = (uuid: string, value: number | null) => {
    setValue(`splitAmount.${uuid}`, value)
  }

  const handleReorder = (newOrder: number[]) => {
    const newPriorities = newOrder.reduce(
      (acc: Record<string, number>, curr: number, currIndex: number) => {
        const split = splits[curr]
        return split ? { ...acc, [split.uuid]: currIndex + 1 } : acc
      },
      {},
    )
    const lastSplitIndex = newOrder[newOrder.length - 1]
    if (lastSplitIndex === undefined) return
    const lastSplit = splits[lastSplitIndex]
    if (!lastSplit) return
    setValue('priority', newPriorities)
    if (remainderId && remainderId !== lastSplit.uuid) {
      resetField(`splitAmount.${remainderId}`)
      updateSplitAmount(remainderId, 0)
    }
    updateSplitAmount(lastSplit.uuid, null)
  }

  const handleCancel = () => {
    resetToDefaults()
    onEvent(componentEvents.CANCEL)
  }

  setValue('isSplit', true)

  if (bankAccounts.length < 2 || paymentMethod.splits === null) return null

  const renderFieldsList = () => {
    if (splitBy === SPLIT_BY.amount) {
      return (
        <ReorderableList
          key={`reorderable-amount-list-${splitBy}`}
          label={t('draggableListLabel')}
          items={splits.map(split => ({
            label: split.name as string,
            content: (
              <AmountField
                key={`amount-${split.uuid}`}
                split={split}
                onChange={value => {
                  updateSplitAmount(split.uuid, value)
                }}
                remainderId={remainderId}
              />
            ),
          }))}
          onReorder={handleReorder}
        />
      )
    }
    return splits.map(split => (
      <PercentageField
        key={`percentage-${split.uuid}`}
        split={split}
        onChange={value => {
          updateSplitAmount(split.uuid, value)
        }}
      />
    ))
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handleSplitSubmit)}>
        <ErrorMessage
          errors={errors}
          name="splitAmount.root"
          render={({ message }) => {
            if (message.startsWith('percentage_split_total_error:')) {
              const total = message.split(':')[1] || '0'
              return (
                <Components.Alert
                  status="error"
                  label={t('validations.percentageErrorWithTotal', { total })}
                />
              )
            }
            return <Components.Alert status="error" label={t('validations.percentageError')} />
          }}
        />
        <Components.Heading as="h2">{t('title')}</Components.Heading>
        <Trans t={t} i18nKey="splitDescription" components={{ p: <Components.Text /> }} />
        <RadioGroupField
          name="splitBy"
          label={t('splitByLabel')}
          options={[
            { value: SPLIT_BY.percentage, label: t('percentageLabel') },
            { value: SPLIT_BY.amount, label: t('amountLabel') },
          ]}
        />
        {paymentMethod.splits && renderFieldsList()}
        <ActionsLayout>
          <Components.Button variant="secondary" type="button" onClick={handleCancel}>
            {t('cancelAddCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      </Form>
    </FormProvider>
  )
}

function AmountField({
  split,
  remainderId,
  onChange,
}: {
  split: Split
  remainderId: string
  onChange: (value: number | null) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberInputField
      name={`splitAmount.${split.uuid}`}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
        interpolation: { escapeValue: false },
      })}
      format="currency"
      min={0}
      isRequired
      errorMessage={t('validations.amountError')}
      placeholder={remainderId === split.uuid ? t('remainderLabel') : ''}
      isDisabled={remainderId === split.uuid}
      onChange={onChange}
    />
  )
}

function PercentageField({
  split,
  onChange,
}: {
  split: Split
  onChange: (value: number) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberInputField
      name={`splitAmount.${split.uuid}`}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
        interpolation: { escapeValue: false },
      })}
      format="percent"
      min={0}
      maximumFractionDigits={0}
      isRequired
      errorMessage={t('validations.percentageAmountError')}
      onChange={onChange}
    />
  )
}
