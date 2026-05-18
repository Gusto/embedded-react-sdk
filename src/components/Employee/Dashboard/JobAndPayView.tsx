import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseLayout } from '@/components/Base/Base'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'
import {
  usePaymentMethodList,
  useDeleteBankAccount,
  DeleteBankAccountDialog,
} from '@/components/Employee/PaymentMethod/shared'
import { ManagementCompensation } from '@/components/Employee/Compensation/management'
import { componentEvents, PAYMENT_METHODS, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import PercentCircleIcon from '@/assets/icons/percent-circle.svg?react'
import DownloadCloudIcon from '@/assets/icons/download-cloud.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

export interface JobAndPayViewProps {
  employeeId: string
  /**
   * The employee's primary job. Forwarded to `ManagementCompensation` as the
   * `hireDate` source for the Add another job flow. The rest of the
   * compensation surface — current/pending rate, edit, secondary jobs — is
   * rendered by `ManagementCompensation` from its own getJobs fetch.
   */
  job?: Job
  garnishments?: Garnishment[]
  payStubs?: EmployeePayStub[]
  payStubsPagination?: PaginationControlProps
  isLoading?: boolean
  onEvent: OnEventType<EventType, unknown>
  onAddDeduction?: () => void
  onPaystubDownload?: (payrollUuid: string) => void
  downloadingPayrollUuids?: ReadonlySet<string>
}

export function JobAndPayView({
  employeeId,
  job,
  garnishments = [],
  payStubs = [],
  payStubsPagination,
  isLoading = false,
  onEvent,
  onAddDeduction,
  onPaystubDownload,
  downloadingPayrollUuids,
}: JobAndPayViewProps) {
  useI18n('Employee.PaymentMethod')
  const { t } = useTranslation('Employee.Dashboard')
  const { t: tPayment } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  const paymentMethodList = usePaymentMethodList({ employeeId })
  const paymentMethod = paymentMethodList.isLoading
    ? undefined
    : paymentMethodList.data.paymentMethod
  const bankAccounts = paymentMethodList.isLoading ? [] : paymentMethodList.data.bankAccounts
  const deletePendingBankAccountUuid = paymentMethodList.isLoading
    ? undefined
    : paymentMethodList.status.deletePendingBankAccountUuid

  const { pendingDeleteAccount, setPendingDeleteAccount, handleConfirmDelete } =
    useDeleteBankAccount(async uuid => {
      if (paymentMethodList.isLoading) return
      const result = await paymentMethodList.actions.onDelete(uuid)
      if (result) {
        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, result.data)
      }
    })

  const bankAccountsColumns = [
    {
      key: 'nickname',
      title: t('jobAndPay.payment.nickname'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.name || '-',
    },
    {
      key: 'routingNumber',
      title: t('jobAndPay.payment.routingNumber'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.routingNumber || '-',
    },
    {
      key: 'accountType',
      title: t('jobAndPay.payment.accountType'),
      render: (bankAccount: EmployeeBankAccount) => bankAccount.accountType || '-',
    },
  ]

  const garnishmentsColumns = [
    {
      key: 'description',
      title: t('jobAndPay.deductions.deduction'),
      render: (garnishment: Garnishment) => garnishment.description || '-',
    },
    {
      key: 'frequency',
      title: t('jobAndPay.deductions.frequency'),
      render: (garnishment: Garnishment) =>
        garnishment.recurring ? t('jobAndPay.deductions.recurring') : '-',
    },
    {
      key: 'amount',
      title: t('jobAndPay.deductions.withhold'),
      render: (garnishment: Garnishment) => {
        if (garnishment.amount && typeof garnishment.amount === 'number') {
          return formatCurrency(garnishment.amount)
        }
        if (garnishment.annualMaximum) {
          return `${garnishment.annualMaximum}% per paycheck`
        }
        return '-'
      },
    },
  ]

  const payStubsColumns = [
    {
      key: 'payday',
      title: t('jobAndPay.paystubs.payday'),
      render: (payStub: EmployeePayStub) => formatDateLongWithYear(payStub.checkDate) || '-',
    },
    {
      key: 'checkAmount',
      title: t('jobAndPay.paystubs.checkAmount'),
      render: (payStub: EmployeePayStub) => {
        if (!payStub.netPay) return '-'
        const amount = parseFloat(payStub.netPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'grossPay',
      title: t('jobAndPay.paystubs.grossPay'),
      render: (payStub: EmployeePayStub) => {
        if (!payStub.grossPay) return '-'
        const amount = parseFloat(payStub.grossPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'paymentMethod',
      title: t('jobAndPay.paystubs.paymentMethod'),
      render: () => paymentMethod?.type || t('jobAndPay.paystubs.noPaymentMethod'),
    },
  ]

  const bankAccountsDataView = useDataView({
    data: bankAccounts,
    columns: bankAccountsColumns,
    itemMenu: (bankAccount: EmployeeBankAccount) => (
      <HamburgerMenu
        items={[
          {
            label: tPayment('deleteBankAccountCta'),
            onClick: () => {
              setPendingDeleteAccount({
                uuid: bankAccount.uuid,
                hiddenAccountNumber: bankAccount.hiddenAccountNumber,
              })
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
        triggerLabel={tPayment('hamburgerTitle')}
      />
    ),
  })

  const garnishmentsDataView = useDataView({
    data: garnishments,
    columns: garnishmentsColumns,
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.deductions.emptyState.title')}
        description={t('jobAndPay.deductions.emptyState.description')}
      />
    ),
  })

  const payStubsDataView = useDataView({
    data: payStubs,
    columns: payStubsColumns,
    pagination: payStubsPagination,
    itemMenu: payStub => {
      const isDownloading =
        !!payStub.payrollUuid && !!downloadingPayrollUuids?.has(payStub.payrollUuid)
      return (
        <Components.ButtonIcon
          variant="tertiary"
          aria-label={t('jobAndPay.paystubs.downloadCta')}
          isDisabled={!payStub.payrollUuid}
          isLoading={isDownloading}
          onClick={() => {
            if (payStub.payrollUuid) {
              onPaystubDownload?.(payStub.payrollUuid)
            }
          }}
        >
          <DownloadCloudIcon aria-hidden />
        </Components.ButtonIcon>
      )
    },
    emptyState: () => (
      <EmptyData
        title={t('jobAndPay.paystubs.emptyState.title')}
        description={t('jobAndPay.paystubs.emptyState.description')}
      />
    ),
  })

  if (isLoading || paymentMethodList.isLoading) {
    return <Loading />
  }

  const isDirectDeposit = paymentMethod?.type === PAYMENT_METHODS.directDeposit

  return (
    <BaseLayout error={paymentMethodList.errorHandling.errors}>
      <Flex flexDirection="column" gap={24}>
        <ManagementCompensation
          employeeId={employeeId}
          hireDate={job?.hireDate ?? ''}
          onEvent={onEvent}
        />

        <Components.Box
          withPadding={bankAccounts.length === 0}
          header={
            <Components.BoxHeader
              title={t('jobAndPay.payment.title')}
              action={
                <Flex gap={8} alignItems="center" justifyContent="flex-end">
                  {isDirectDeposit && bankAccounts.length > 1 && (
                    <Components.Button
                      variant="secondary"
                      onClick={() => {
                        onEvent(componentEvents.EMPLOYEE_SPLIT_PAYCHECK, { employeeId })
                      }}
                      icon={<PercentCircleIcon />}
                    >
                      {t('jobAndPay.payment.splitPaycheckCta')}
                    </Components.Button>
                  )}
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE, { employeeId })
                    }}
                    icon={<PlusCircleIcon />}
                  >
                    {t('jobAndPay.payment.addBankAccountCta')}
                  </Components.Button>
                </Flex>
              }
            />
          }
        >
          {bankAccounts.length === 0 ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text variant="supporting">
                {tPayment('paymentMethodLabel')}
              </Components.Text>
              <Components.Text>
                {isDirectDeposit ? tPayment('directDepositLabel') : tPayment('checkLabel')}
              </Components.Text>
            </Flex>
          ) : (
            <DataView
              label={t('jobAndPay.payment.listLabel')}
              isWithinBox
              {...bankAccountsDataView}
            />
          )}
        </Components.Box>

        <Components.Box
          withPadding={false}
          header={
            <Components.BoxHeader
              title={t('jobAndPay.deductions.title')}
              action={
                <Components.Button
                  variant="secondary"
                  onClick={onAddDeduction}
                  icon={<PlusCircleIcon />}
                >
                  {t('jobAndPay.deductions.addDeductionCta')}
                </Components.Button>
              }
            />
          }
        >
          <DataView
            label={t('jobAndPay.deductions.listLabel')}
            isWithinBox
            {...garnishmentsDataView}
          />
        </Components.Box>

        <Components.Box
          withPadding={false}
          header={<Components.BoxHeader title={t('jobAndPay.paystubs.title')} />}
        >
          <DataView label={t('jobAndPay.paystubs.listLabel')} isWithinBox {...payStubsDataView} />
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
      </Flex>
    </BaseLayout>
  )
}
