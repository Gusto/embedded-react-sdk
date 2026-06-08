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
import DownloadCloudIcon from '@/assets/icons/download-cloud.svg?react'

export interface PaystubsCardProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Paystubs" card. Owns its own data fetch via
 * {@link usePaystubsList} and renders the paginated paystubs table with a
 * per-row PDF download action. Emits the management block's scoped events
 * (`EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_*`) on download request and on
 * download success. The card has no edit transitions and no alert API —
 * paystubs is a read-only surface whose only action is a download side
 * effect that opens the PDF in a new tab.
 */
export function PaystubsCard(props: PaystubsCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.Paystubs">
      <PaystubsCardContent {...props} />
    </BaseBoundaries>
  )
}

function PaystubsCardContent({ employeeId, onEvent }: PaystubsCardProps) {
  useI18n('Employee.Management.Paystubs')
  const { t } = useTranslation('Employee.Management.Paystubs')
  const Components = useComponentContext()
  const paystubsList = usePaystubsList({ employeeId })
  const paymentMethodList = usePaymentMethodList({ employeeId })

  const errorHandling = composeErrorHandler([paystubsList, paymentMethodList])

  if (paystubsList.isLoading) {
    return (
      <BaseLayout error={errorHandling.errors}>
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
}: PaystubsCardReadyProps) {
  const { t } = useTranslation('Employee.Management.Paystubs')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')
  const { showBoundary } = useErrorBoundary()

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

      // Omit `noopener` — it makes window.open return null in modern browsers,
      // which would leave us unable to navigate the new tab to the blob URL.
      const newWindow = window.open('', '_blank')
      const loadingMessage = t('downloadLoadingMessage')
      if (newWindow) {
        // Avoid the user staring at about:blank while we fetch the PDF. The
        // navigation to the Blob URL below replaces this document.
        const doc = newWindow.document
        doc.title = loadingMessage
        const style = doc.createElement('style')
        style.textContent =
          'body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;' +
          'justify-content:center;height:100vh;margin:0;color:#444;gap:12px}' +
          '.spinner{width:20px;height:20px;border:2px solid #ccc;border-top-color:#444;' +
          'border-radius:50%;animation:spin .8s linear infinite}' +
          '@keyframes spin{to{transform:rotate(360deg)}}'
        doc.head.appendChild(style)
        const spinner = doc.createElement('div')
        spinner.className = 'spinner'
        spinner.setAttribute('aria-hidden', 'true')
        const label = doc.createElement('span')
        label.textContent = loadingMessage
        doc.body.replaceChildren(spinner, label)
      }
      setDownloadingPayrollUuids(prev => {
        const next = new Set(prev)
        next.add(payrollUuid)
        return next
      })
      try {
        const result = await paystubsList.actions.downloadPayStub(payrollUuid)
        if (!result) {
          if (newWindow) newWindow.close()
          return
        }
        const url = URL.createObjectURL(result.data)
        if (newWindow) {
          // Revoke after the new tab has loaded the blob; revoking synchronously
          // would race the navigation and leave the tab blank.
          newWindow.addEventListener('load', () => {
            URL.revokeObjectURL(url)
          })
          newWindow.location.href = url
        } else {
          URL.revokeObjectURL(url)
        }
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOADED, {
          employeeId,
          payrollUuid,
        })
      } catch (err) {
        if (newWindow) newWindow.close()
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
    [paystubsList.actions, onEvent, employeeId, t, showBoundary],
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
      render: (payStub: EmployeePayStub) => {
        if (!payStub.netPay) return '-'
        const amount = parseFloat(payStub.netPay)
        return isNaN(amount) ? '-' : formatCurrency(amount)
      },
    },
    {
      key: 'grossPay',
      title: t('grossPay'),
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
    <BaseLayout error={errorHandling.errors}>
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
