import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { Location } from '@gusto/embedded-api/models/components/location'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import {
  formatPendingWorkAddressLine,
  getPendingFutureWorkAddress,
} from './getPendingFutureWorkAddress'
import ListIcon from '@/assets/icons/list.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { DataView, EmptyData, Grid, HamburgerMenu, useDataView } from '@/components/Common'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import {
  LocationField,
  EffectiveDateField,
} from '@/components/Employee/Profile/shared/useWorkAddressForm/fields'
import { WorkAddressErrorCodes } from '@/components/Employee/Profile/shared/useWorkAddressForm/workAddressSchema'
import type { UseWorkAddressFormReady } from '@/components/Employee/Profile/shared/useWorkAddressForm'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { addDays, formatDateLongWithYear, normalizeToDate } from '@/helpers/dateFormatting'
import { getCityStateZip, getStreet } from '@/helpers/formattedStrings'

export interface WorkAddressViewProps {
  editWorkAddressForm: UseWorkAddressFormReady
  changeWorkAddressForm: UseWorkAddressFormReady
  editTargetUuid: string | undefined
  onEditTargetUuidChange: (uuid: string | undefined) => void
  employeeDisplayName: string
  onConfirmDelete: (workAddressUuid: string) => Promise<boolean>
  onWorkAddressSaved: (result: HookSubmitResult<EmployeeWorkAddress>) => void
  isDeletePending?: boolean
}

function resolveLocation(
  row: EmployeeWorkAddress,
  companyLocations: Location[] | undefined,
): Location | undefined {
  if (!row.locationUuid || !companyLocations?.length) {
    return undefined
  }
  return companyLocations.find(loc => loc.uuid === row.locationUuid)
}

function formatWorkAddressLines(
  row: EmployeeWorkAddress,
  companyLocations: Location[] | undefined,
): { primary: string; secondary: string } {
  const location = resolveLocation(row, companyLocations)
  if (location) {
    const street = getStreet(location).trim()
    const locality = getCityStateZip(location).trim()
    return { primary: street, secondary: locality }
  }
  const street = getStreet(row).trim()
  const locality = getCityStateZip(row).trim()
  return { primary: street, secondary: locality }
}

export function WorkAddressView({
  editWorkAddressForm,
  changeWorkAddressForm,
  editTargetUuid,
  onEditTargetUuidChange,
  employeeDisplayName,
  onConfirmDelete,
  onWorkAddressSaved,
  isDeletePending = false,
}: WorkAddressViewProps) {
  const { t } = useTranslation('Employee.WorkAddress.Management')
  const Components = useComponentContext()
  const [addressModal, setAddressModal] = useState<'edit' | 'create' | null>(null)
  const [deleteConfirmUuid, setDeleteConfirmUuid] = useState<string | null>(null)
  const addressModalContainerRef = useRef<HTMLDivElement>(null)
  const [addressModalPortal, setAddressModalPortal] = useState<HTMLElement | undefined>(undefined)

  useLayoutEffect(() => {
    if (!addressModal) {
      setAddressModalPortal(undefined)
      return
    }
    const syncPortal = () => {
      setAddressModalPortal(addressModalContainerRef.current ?? undefined)
    }
    syncPortal()
    if (addressModalContainerRef.current == null) {
      const id = requestAnimationFrame(syncPortal)
      return () => {
        cancelAnimationFrame(id)
      }
    }
  }, [addressModal])

  const {
    data: { workAddress, workAddresses, companyLocations },
    status: editStatus,
    form: { Fields: editFormFields },
  } = editWorkAddressForm

  const editShowsEffectiveDateField = editFormFields.EffectiveDate != null

  const { status: createStatus } = changeWorkAddressForm

  const locationValidation = {
    [WorkAddressErrorCodes.REQUIRED]: t('form.locationRequired'),
  }

  const startDateValidation = {
    [WorkAddressErrorCodes.REQUIRED]: t('form.startDateRequired'),
  }

  const pendingFutureAddress = useMemo(
    () => getPendingFutureWorkAddress(workAddresses),
    [workAddresses],
  )

  const addressForDeleteModal = useMemo(() => {
    if (!deleteConfirmUuid || !workAddresses) {
      return undefined
    }
    return workAddresses.find(a => a.uuid === deleteConfirmUuid)
  }, [deleteConfirmUuid, workAddresses])

  const changePendingPossessiveLabel = useMemo(() => {
    const trimmed = employeeDisplayName.trim()
    return trimmed ? `${trimmed}'s` : t('changePendingPossessiveFallback')
  }, [employeeDisplayName, t])

  const chronologicalAsc = useMemo(() => {
    return [...(workAddresses ?? [])].sort((a, b) => {
      const aDate = a.effectiveDate ?? ''
      const bDate = b.effectiveDate ?? ''
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      return aDate.localeCompare(bDate)
    })
  }, [workAddresses])

  const historyAddresses = useMemo(
    () => chronologicalAsc.filter(address => address.active !== true),
    [chronologicalAsc],
  )

  const sortedHistory = useMemo(() => [...historyAddresses].reverse(), [historyAddresses])

  const historyEndDate = (row: EmployeeWorkAddress) => {
    const idx = chronologicalAsc.findIndex(a => a.uuid === row.uuid)
    if (idx === -1 || idx >= chronologicalAsc.length - 1) return '—'
    const nextStart = chronologicalAsc[idx + 1]?.effectiveDate
    if (!nextStart) return '—'
    const nextDate = normalizeToDate(nextStart)
    if (!nextDate) return '—'
    const endDate = addDays(nextDate, -1)
    const y = endDate.getFullYear()
    const m = String(endDate.getMonth() + 1).padStart(2, '0')
    const d = String(endDate.getDate()).padStart(2, '0')
    return formatDateLongWithYear(`${y}-${m}-${d}`)
  }

  const historyDataView = useDataView({
    data: sortedHistory,
    columns: [
      {
        title: t('columns.location'),
        render: (row: EmployeeWorkAddress) => {
          const lines = formatWorkAddressLines(row, companyLocations)
          return (
            <Flex flexDirection="column" gap={0}>
              <Components.Text weight="medium">{lines.primary}</Components.Text>
              <Components.Text variant="supporting">{lines.secondary}</Components.Text>
            </Flex>
          )
        },
      },
      {
        title: t('columns.startDate'),
        render: (row: EmployeeWorkAddress) =>
          row.effectiveDate ? formatDateLongWithYear(row.effectiveDate) : '—',
      },
      {
        title: t('columns.endDate'),
        render: (row: EmployeeWorkAddress) => historyEndDate(row),
      },
    ],
    itemMenu: (row: EmployeeWorkAddress) => (
      <HamburgerMenu
        triggerLabel={t('rowMenuAriaLabel')}
        items={[
          {
            label: t('rowEdit'),
            onClick: () => {
              onEditTargetUuidChange(row.uuid)
              setAddressModal('edit')
            },
            icon: <PencilSvg aria-hidden />,
          },
          {
            label: t('rowDelete'),
            onClick: () => {
              if (row.active === true) {
                return
              }
              setDeleteConfirmUuid(row.uuid)
            },
            icon: <TrashCanSvg aria-hidden />,
          },
        ]}
      />
    ),
    emptyState: () => (
      <div data-testid="work-address-history-empty">
        <EmptyData
          icon={<ListIcon aria-hidden />}
          title={t('historyEmptyTitle')}
          description={t('historyEmptyDescription')}
        />
      </div>
    ),
  })

  const closeAddressModal = () => {
    setAddressModal(null)
    onEditTargetUuidChange(undefined)
  }

  const handleDeleteModalConfirm = async () => {
    if (!deleteConfirmUuid) {
      return
    }
    const deleted = await onConfirmDelete(deleteConfirmUuid)
    if (deleted) {
      setDeleteConfirmUuid(null)
    }
  }

  const handleSave = async () => {
    if (!addressModal) {
      return
    }
    const addressBeingEdited =
      editTargetUuid && workAddresses
        ? workAddresses.find(a => a.uuid === editTargetUuid)
        : workAddress

    if (addressModal === 'edit') {
      const result = await editWorkAddressForm.actions.onSubmit(
        undefined,
        editShowsEffectiveDateField
          ? undefined
          : { effectiveDate: addressBeingEdited?.effectiveDate },
      )
      if (result) {
        onWorkAddressSaved(result)
        closeAddressModal()
      }
      return
    }

    const result = await changeWorkAddressForm.actions.onSubmit()
    if (result) {
      onWorkAddressSaved(result)
      closeAddressModal()
    }
  }

  const modalPending = addressModal === 'edit' ? editStatus.isPending : createStatus.isPending

  const currentLines = workAddress ? formatWorkAddressLines(workAddress, companyLocations) : null
  const currentLocation =
    workAddress && companyLocations ? resolveLocation(workAddress, companyLocations) : undefined

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8} alignItems="flex-start">
        <Components.Heading as="h1">{t('title')}</Components.Heading>
        <Components.Text variant="supporting">{t('description')}</Components.Text>
      </Flex>

      <Components.Box
        header={
          <Components.BoxHeader
            title={t('currentSectionTitle')}
            action={
              workAddress ? (
                <Components.Button
                  variant="secondary"
                  onClick={() => {
                    onEditTargetUuidChange(undefined)
                    setAddressModal('edit')
                  }}
                  isLoading={editStatus.isPending}
                >
                  {t('editCta')}
                </Components.Button>
              ) : undefined
            }
          />
        }
        footer={
          <Components.Button
            variant="secondary"
            onClick={() => {
              onEditTargetUuidChange(undefined)
              setAddressModal('create')
            }}
            isLoading={createStatus.isPending}
          >
            {t('changeCta')}
          </Components.Button>
        }
      >
        <Flex flexDirection="column" gap={16}>
          {workAddress && currentLines ? (
            <Flex flexDirection="column" gap={4}>
              <FlexItem>
                {currentLocation ? (
                  <>
                    <Components.Text weight="medium">
                      {getStreet(currentLocation).trim()}
                    </Components.Text>
                    <Components.Text weight="medium">
                      {getCityStateZip(currentLocation)}
                    </Components.Text>
                  </>
                ) : (
                  <>
                    <Components.Text weight="medium">{currentLines.primary}</Components.Text>
                    <Components.Text weight="medium">{currentLines.secondary}</Components.Text>
                  </>
                )}
              </FlexItem>
              {workAddress.effectiveDate ? (
                <Components.Text variant="supporting">
                  {t('currentSince', {
                    date: formatDateLongWithYear(workAddress.effectiveDate),
                  })}
                </Components.Text>
              ) : null}
            </Flex>
          ) : (
            <Components.Text>{t('currentEmpty')}</Components.Text>
          )}
          {pendingFutureAddress ? (
            <Components.Alert status="warning" label={t('changePendingTitle')}>
              <Components.Text variant="supporting">
                {t('changePendingDescription', {
                  possessiveLabel: changePendingPossessiveLabel,
                  newAddress: formatPendingWorkAddressLine(pendingFutureAddress, companyLocations),
                  effectiveDate: pendingFutureAddress.effectiveDate
                    ? formatDateLongWithYear(pendingFutureAddress.effectiveDate)
                    : '—',
                })}
              </Components.Text>
            </Components.Alert>
          ) : null}
        </Flex>
      </Components.Box>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">{t('historySectionTitle')}</Components.Heading>
        <DataView label={t('historySectionTitle')} {...historyDataView} />
      </Flex>

      <Components.Modal
        isOpen={addressModal !== null}
        onClose={closeAddressModal}
        shouldCloseOnBackdropClick={false}
        containerRef={addressModalContainerRef}
        footer={
          <Flex flexDirection="row" gap={12} justifyContent="flex-end">
            <Components.Button variant="secondary" onClick={closeAddressModal}>
              {t('cancelCta')}
            </Components.Button>
            <Components.Button
              variant="primary"
              onClick={() => {
                void handleSave()
              }}
              isLoading={modalPending}
            >
              {t('submitCta')}
            </Components.Button>
          </Flex>
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Components.Heading as="h2">
            {addressModal === 'edit' ? t('editModalTitle') : t('changeModalTitle')}
          </Components.Heading>
          <Components.Text variant="supporting">
            {addressModal === 'edit' ? t('editModalDescription') : t('changeModalDescription')}
          </Components.Text>
          {addressModal === 'edit' && editShowsEffectiveDateField ? (
            <Components.Alert status="warning" label={t('editPastAddressAlertTitle')} />
          ) : null}
          {addressModal === 'edit' ? (
            <SDKFormProvider formHookResult={editWorkAddressForm}>
              <Grid
                gridTemplateColumns={{
                  base: '1fr',
                  small: '1fr',
                }}
                gap={20}
              >
                <LocationField
                  label={
                    editShowsEffectiveDateField
                      ? t('form.editInactiveLocationLabel')
                      : t('form.editLocationLabel')
                  }
                  description={t('form.editLocationDescription')}
                  validationMessages={locationValidation}
                  portalContainer={addressModalPortal}
                />
                {editShowsEffectiveDateField ? (
                  <EffectiveDateField
                    label={t('form.startDateLabel')}
                    description={t('form.editInactiveStartDateDescription')}
                    validationMessages={startDateValidation}
                    portalContainer={addressModalPortal}
                  />
                ) : null}
              </Grid>
            </SDKFormProvider>
          ) : null}
          {addressModal === 'create' ? (
            <SDKFormProvider formHookResult={changeWorkAddressForm}>
              <Grid
                gridTemplateColumns={{
                  base: '1fr',
                  small: '1fr',
                }}
                gap={20}
              >
                <LocationField
                  label={t('form.newWorkAddressLabel')}
                  description={t('form.newWorkAddressDescription')}
                  validationMessages={locationValidation}
                  portalContainer={addressModalPortal}
                />
                <EffectiveDateField
                  label={t('form.startDateLabel')}
                  description={t('form.startDateDescription')}
                  validationMessages={startDateValidation}
                  portalContainer={addressModalPortal}
                />
              </Grid>
            </SDKFormProvider>
          ) : null}
        </Flex>
      </Components.Modal>

      <Components.Modal
        isOpen={deleteConfirmUuid !== null}
        onClose={() => {
          setDeleteConfirmUuid(null)
        }}
        shouldCloseOnBackdropClick={false}
        footer={
          <Flex flexDirection="row" gap={12} justifyContent="flex-end">
            <Components.Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmUuid(null)
              }}
            >
              {t('cancelCta')}
            </Components.Button>
            <Components.Button
              variant="error"
              onClick={() => {
                void handleDeleteModalConfirm()
              }}
              isLoading={isDeletePending && deleteConfirmUuid !== null}
            >
              {t('deleteModalConfirmCta')}
            </Components.Button>
          </Flex>
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Components.Heading as="h2">{t('deleteModalTitle')}</Components.Heading>
          <Components.Text variant="supporting">
            {addressForDeleteModal ? (
              <Trans
                t={t}
                i18nKey="deleteModalDescription"
                values={{
                  address: formatPendingWorkAddressLine(addressForDeleteModal, companyLocations),
                }}
                components={{
                  strong: <Components.Text weight="medium" as="span" />,
                }}
              />
            ) : null}
          </Components.Text>
        </Flex>
      </Components.Modal>
    </Flex>
  )
}
