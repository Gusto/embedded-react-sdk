import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useErrorBoundary } from 'react-error-boundary'
import {
  usePaystubsList,
  type EmployeePayStub,
  type UsePaystubsListReady,
} from '../../shared/usePaystubsList'
import { DataView, EmptyData, useDataView, Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useNonce } from '@/contexts/NonceProvider'
import { openPdfInNewTab } from '@/helpers/openPdfInNewTab'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import {
  usePaymentMethodList,
  type UsePaymentMethodListResult,
} from '@/components/Employee/PaymentMethod/shared'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'
import DownloadCloudIcon from '@/assets/icons/download-cloud.svg?react'

/**
 * Props for {@link PaystubsCard}.
 *
 * @public
 */
export interface PaystubsCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired when paystub interactions occur. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone "Paystubs" card. Owns its own data fetch via
 * {@link usePaystubsList} and renders the paginated paystubs table with a
 * per-row PDF download action. Emits the management block's scoped events
 * (`EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_*`) on download request and on
 * download success. The card has no edit transitions and no alert API —
 * paystubs is a read-only surface whose only action is a download side
 * effect that opens the PDF in a new tab.
 *
 * @public
 */
export function PaystubsCard({ LoaderComponent, ...props }: PaystubsCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.Paystubs" LoaderComponent={LoaderComponent}>
      <PaystubsCardContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function PaystubsCardContent({ employeeId, onEvent, LoaderComponent }: PaystubsCardProps) {
  useI18n('Employee.Management.Paystubs')
  const { t } = useTranslation('Employee.Management.Paystubs')
  const Components = useComponentContext()
  const paystubsList = usePaystubsList({ employeeId })
  const paymentMethodList = usePaymentMethodList({ employeeId })

  const errorHandling = composeErrorHandler([paystubsList, paymentMethodList])

  if (paystubsList.isLoading) {
    return (
      <BaseLayout error={errorHandling.errors} LoaderComponent={LoaderComponent}>
        <Components.Box header={<Components.BoxHeader title={t('title')} />}>
          <Loading />
        </Components.Box>
      </BaseLayout>
    )
  }

  return (
    <PaystubsCardReady
      employeeId={employeeId}
      onEvent={onEvent}
      paystubsList={paystubsList}
      paymentMethodList={paymentMethodList}
      errorHandling={errorHandling}
      LoaderComponent={LoaderComponent}
    />
  )
}

interface PaystubsCardReadyProps extends PaystubsCardProps {
  paystubsList: UsePaystubsListReady
  paymentMethodList: UsePaymentMethodListResult
  errorHandling: ReturnType<typeof composeErrorHandler>
}

function PaystubsCardReady({
  employeeId,
  onEvent,
  paystubsList,
  paymentMethodList,
  errorHandling,
  LoaderComponent,
}: PaystubsCardReadyProps) {
  const { t } = useTranslation('Employee.Management.Paystubs')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')
  const { showBoundary } = useErrorBoundary()
  const nonce = useNonce()

  const [downloadingPayrollUuids, setDownloadingPayrollUuids] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const { payStubs } = paystubsList.data
  const payStubsPagination = paystubsList.pagination.payStubs
  const paymentMethod = paymentMethodList.isLoading
    ? undefined
    : paymentMethodList.data.paymentMethod

  const handleDownload = useCallback(
    async (payrollUuid: string) => {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED, {
        employeeId,
        payrollUuid,
      })

      const tab = openPdfInNewTab({ loadingMessage: t('downloadLoadingMessage'), nonce })
      setDownloadingPayrollUuids(prev => {
        const next = new Set(prev)
        next.add(payrollUuid)
        return next
      })
      try {
        const result = await paystubsList.actions.downloadPayStub(payrollUuid)
        if (!result) {
          tab.close()
          return
        }
        tab.navigate(result.data)
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOADED, {
          employeeId,
          payrollUuid,
        })
      } catch (err) {
        tab.close()
        showBoundary(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setDownloadingPayrollUuids(prev => {
          if (!prev.has(payrollUuid)) return prev
          const next = new Set(prev)
          next.delete(payrollUuid)
          return next
        })
      }
    },
    [paystubsList.actions, onEvent, employeeId, t, showBoundary, nonce],
  )

  const payStubsColumns = [
    {
      key: 'payday',
      title: t('payday'),
      render: (payStub: EmployeePayStub) => formatDateLongWithYear(payStub.checkDate) || '-',
    },
    {
      key: 'checkAmount',
      title: t('checkAmount'),
      justify: 'end' as const,
      render: (payStub: EmployeePayStub) => {
        if (!payStub.netPay) return '-'
        const amount = parseFloat(payStub.netPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'grossPay',
      title: t('grossPay'),
      justify: 'end' as const,
      render: (payStub: EmployeePayStub) => {
        if (!payStub.grossPay) return '-'
        const amount = parseFloat(payStub.grossPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'paymentMethod',
      title: t('paymentMethod'),
      render: () => paymentMethod?.type || t('noPaymentMethod'),
    },
  ]

  const payStubsDataView = useDataView({
    data: payStubs,
    columns: payStubsColumns,
    pagination: payStubsPagination,
    itemMenu: payStub => {
      const isDownloading =
        !!payStub.payrollUuid && downloadingPayrollUuids.has(payStub.payrollUuid)
      return (
        <Components.ButtonIcon
          variant="tertiary"
          aria-label={t('downloadCta')}
          isDisabled={!payStub.payrollUuid}
          isLoading={isDownloading}
          onClick={() => {
            if (payStub.payrollUuid) {
              void handleDownload(payStub.payrollUuid)
            }
          }}
        >
          <DownloadCloudIcon aria-hidden />
        </Components.ButtonIcon>
      )
    },
    emptyState: () => (
      <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
    ),
  })

  const isShowingTable = payStubs.length > 0

  return (
    <BaseLayout error={errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        withPadding={!isShowingTable}
        header={<Components.BoxHeader title={t('title')} />}
      >
        {isShowingTable ? (
          <DataView label={t('listLabel')} isWithinBox {...payStubsDataView} />
        ) : (
          <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
        )}
      </Components.Box>
    </BaseLayout>
  )
}
