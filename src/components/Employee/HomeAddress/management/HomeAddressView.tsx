import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { TFunction } from 'i18next'
import {
  formatPendingHomeAddressLine,
  getPendingFutureHomeAddress,
} from './getPendingFutureHomeAddress'
import HouseIcon from '@/assets/icons/house.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { HomeAddressErrorCodes } from '@/components/Employee/Profile/shared/useHomeAddressForm/homeAddressSchema'
import type { UseHomeAddressFormReady } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { DataView, EmptyData, HamburgerMenu, useDataView } from '@/components/Common'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import { Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { addDays, formatDateLongWithYear, normalizeToDate } from '@/helpers/dateFormatting'
import { formatStreetForDisplay, getCityStateZip } from '@/helpers/formattedStrings'

function HomeAddressCourtesyWithholdingBlock({
  CourtesyWithholding,
  formHook,
  tHa,
}: {
  CourtesyWithholding: UseHomeAddressFormReady['form']['Fields']['CourtesyWithholding']
  formHook: UseHomeAddressFormReady
  tHa: TFunction<'Employee.HomeAddress'>
}) {
  const Components = useComponentContext()
  const { control } = formHook.form.hookFormInternals.formMethods
  const courtesyWithholdingEnabled = useWatch({ control, name: 'courtesyWithholding' })

  return (
    <>
      <CourtesyWithholding
        label={tHa('courtesyWithholdingLabel')}
        description={
          <>
            {tHa('courtesyWithholdingDescription')}
            <Trans
              t={tHa}
              i18nKey="learnMoreCta"
              components={{
                LearnMoreLink: <Components.Link />,
              }}
            />
          </>
        }
      />
      {courtesyWithholdingEnabled ? (
        <Components.Alert label={tHa('withholdingTitle')} status="warning">
          <Trans t={tHa} i18nKey="withholdingNote" />
        </Components.Alert>
      ) : null}
    </>
  )
}

export interface HomeAddressViewProps {
  editHomeAddressForm: UseHomeAddressFormReady
  createHomeAddressForm: UseHomeAddressFormReady
  employeeDisplayName: string
  /** Resolved UUID passed to the edit form (`homeAddressUuid`); active row when not editing history. */
  editingHomeAddressUuid: string | undefined
  /** `undefined` = edit active/current address; otherwise set to a history row’s UUID. */
  onEditAddressTargetChange: (homeAddressUuid: string | undefined) => void
  onSaved: (result: HookSubmitResult<EmployeeAddress>) => void
  onConfirmDelete: (homeAddressUuid: string) => Promise<boolean>
  isDeletePending?: boolean
}

export function HomeAddressView({
  editHomeAddressForm,
  createHomeAddressForm,
  employeeDisplayName,
  editingHomeAddressUuid,
  onEditAddressTargetChange,
  onSaved,
  onConfirmDelete,
  isDeletePending = false,
}: HomeAddressViewProps) {
  const { t } = useTranslation('Employee.HomeAddress.Management')
  const { t: tHa } = useTranslation('Employee.HomeAddress')
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
    data: { homeAddress, homeAddresses },
    status: editStatus,
    actions: { onSubmit: editOnSubmit },
    form: editForm,
  } = editHomeAddressForm

  const {
    status: createStatus,
    actions: { onSubmit: createOnSubmit },
    form: createForm,
  } = createHomeAddressForm

  const {
    Fields: {
      Street1: EditStreet1,
      Street2: EditStreet2,
      City: EditCity,
      State: EditState,
      Zip: EditZip,
      CourtesyWithholding: EditCourtesyWithholding,
    },
  } = editForm

  const {
    Fields: {
      Street1: CreateStreet1,
      Street2: CreateStreet2,
      City: CreateCity,
      State: CreateState,
      Zip: CreateZip,
      CourtesyWithholding: CreateCourtesyWithholding,
      EffectiveDate: CreateEffectiveDate,
    },
  } = createForm

  const zipValidation = {
    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.zip'),
    [HomeAddressErrorCodes.INVALID_ZIP]: tHa('validations.zip'),
  }

  const startDateValidation = {
    [HomeAddressErrorCodes.REQUIRED]: t('form.startDateRequired'),
  }

  const pendingFutureAddress = useMemo(
    () => getPendingFutureHomeAddress(homeAddresses),
    [homeAddresses],
  )

  const addressForDeleteModal = useMemo(() => {
    if (!deleteConfirmUuid || !homeAddresses) {
      return undefined
    }
    return homeAddresses.find(a => a.uuid === deleteConfirmUuid)
  }, [deleteConfirmUuid, homeAddresses])

  const changePendingPossessiveLabel = useMemo(() => {
    const trimmed = employeeDisplayName.trim()
    return trimmed ? `${trimmed}'s` : t('changePendingPossessiveFallback')
  }, [employeeDisplayName, t])

  const chronologicalAsc = [...(homeAddresses ?? [])].sort((a, b) => {
    const aDate = a.effectiveDate?.toString() ?? ''
    const bDate = b.effectiveDate?.toString() ?? ''
    if (!aDate && !bDate) return 0
    if (!aDate) return 1
    if (!bDate) return -1
    return aDate.localeCompare(bDate)
  })

  const historyAddresses = chronologicalAsc.filter(address => address.active !== true)
  const sortedHistory = [...historyAddresses].reverse()

  const historyEndDate = (row: EmployeeAddress) => {
    const idx = chronologicalAsc.findIndex(a => a.uuid === row.uuid)
    if (idx === -1 || idx >= chronologicalAsc.length - 1) return '—'
    const nextStart = chronologicalAsc[idx + 1]?.effectiveDate
    if (!nextStart) return '—'
    const nextDate = normalizeToDate(nextStart.toString())
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
        title: t('columns.address'),
        render: (row: EmployeeAddress) => (
          <Flex flexDirection="column" gap={0}>
            <Components.Text weight="medium">{formatStreetForDisplay(row)}</Components.Text>
            <Components.Text variant="supporting">{getCityStateZip(row)}</Components.Text>
          </Flex>
        ),
      },
      {
        title: t('columns.startDate'),
        render: (row: EmployeeAddress) =>
          row.effectiveDate ? formatDateLongWithYear(row.effectiveDate.toString()) : '—',
      },
      {
        title: t('columns.endDate'),
        render: (row: EmployeeAddress) => historyEndDate(row),
      },
    ],
    itemMenu: (row: EmployeeAddress) => (
      <HamburgerMenu
        triggerLabel={t('rowMenuAriaLabel')}
        items={[
          {
            label: t('rowEdit'),
            onClick: () => {
              onEditAddressTargetChange(row.uuid)
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
      <div data-testid="home-address-history-empty">
        <EmptyData
          icon={<HouseIcon aria-hidden />}
          title={t('historyEmptyTitle')}
          description={t('historyEmptyDescription')}
        />
      </div>
    ),
  })

  const closeAddressModal = () => {
    setAddressModal(null)
    onEditAddressTargetChange(undefined)
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

  const addressModalSession =
    addressModal === 'edit'
      ? {
          onSubmit: editOnSubmit,
          formMethods: editHomeAddressForm.form.hookFormInternals.formMethods,
          isPending: editStatus.isPending,
        }
      : addressModal === 'create'
        ? {
            onSubmit: createOnSubmit,
            formMethods: createHomeAddressForm.form.hookFormInternals.formMethods,
            isPending: createStatus.isPending,
          }
        : null

  const handleSave = async () => {
    if (!addressModalSession) {
      return
    }

    const submitResult = await addressModalSession.onSubmit()

    if (submitResult) {
      onSaved(submitResult)
    }

    const hasFieldErrors = Object.keys(addressModalSession.formMethods.formState.errors).length > 0
    if (submitResult || !hasFieldErrors) {
      closeAddressModal()
    }
  }

  const modalPending = addressModalSession?.isPending ?? false

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
              homeAddress ? (
                <Components.Button
                  variant="secondary"
                  onClick={() => {
                    onEditAddressTargetChange(undefined)
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
              onEditAddressTargetChange(undefined)
              setAddressModal('create')
            }}
            isLoading={createStatus.isPending}
          >
            {t('changeCta')}
          </Components.Button>
        }
      >
        <Flex flexDirection="column" gap={16}>
          {homeAddress ? (
            <Flex flexDirection="column" gap={4}>
              <FlexItem>
                <Components.Text weight="medium">
                  {formatStreetForDisplay(homeAddress)}
                </Components.Text>
                <Components.Text weight="medium">{getCityStateZip(homeAddress)}</Components.Text>
              </FlexItem>
              {homeAddress.effectiveDate ? (
                <Components.Text variant="supporting">
                  {t('currentSince', {
                    date: formatDateLongWithYear(homeAddress.effectiveDate.toString()),
                  })}
                </Components.Text>
              ) : null}
            </Flex>
          ) : (
            <Components.Text>{tHa('formTitle')}</Components.Text>
          )}
          {pendingFutureAddress ? (
            <Components.Alert status="warning" label={t('changePendingTitle')}>
              <Components.Text variant="supporting">
                {t('changePendingDescription', {
                  possessiveLabel: changePendingPossessiveLabel,
                  newAddress: formatPendingHomeAddressLine(pendingFutureAddress),
                  effectiveDate: pendingFutureAddress.effectiveDate
                    ? formatDateLongWithYear(pendingFutureAddress.effectiveDate.toString())
                    : '—',
                  interpolation: { escapeValue: false },
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
            <Components.Button
              variant="secondary"
              onClick={() => {
                closeAddressModal()
              }}
            >
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
            {addressModal === 'edit' ? t('editModalTitle') : t('createModalTitle')}
          </Components.Heading>
          <Components.Text variant="supporting">
            {addressModal === 'edit' ? t('editModalDescription') : t('createModalDescription')}
          </Components.Text>
          {addressModal === 'edit' ? (
            <SDKFormProvider formHookResult={editHomeAddressForm}>
              <Grid
                gridTemplateColumns={{
                  base: '1fr',
                  small: '1fr',
                }}
                gap={20}
              >
                <EditStreet1
                  label={tHa('street1')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                  }}
                />
                <EditStreet2
                  label={tHa('street2')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                  }}
                />
                <EditCity
                  label={tHa('city')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.city'),
                  }}
                />
                <EditState
                  label={tHa('state')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.state'),
                  }}
                  portalContainer={addressModalPortal}
                />
                <EditZip label={tHa('zip')} validationMessages={zipValidation} />
                <HomeAddressCourtesyWithholdingBlock
                  CourtesyWithholding={EditCourtesyWithholding}
                  formHook={editHomeAddressForm}
                  tHa={tHa}
                />
              </Grid>
            </SDKFormProvider>
          ) : null}
          {addressModal === 'create' ? (
            <SDKFormProvider formHookResult={createHomeAddressForm}>
              <Grid
                gridTemplateColumns={{
                  base: '1fr',
                  small: '1fr',
                }}
                gap={20}
              >
                {CreateEffectiveDate ? (
                  <CreateEffectiveDate
                    label={t('columns.startDate')}
                    description={t('startDateHelper')}
                    validationMessages={startDateValidation}
                    portalContainer={addressModalPortal}
                  />
                ) : null}
                <CreateStreet1
                  label={tHa('street1')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                  }}
                />
                <CreateStreet2
                  label={tHa('street2')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                  }}
                />
                <CreateCity
                  label={tHa('city')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.city'),
                  }}
                />
                <CreateState
                  label={tHa('state')}
                  validationMessages={{
                    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.state'),
                  }}
                  portalContainer={addressModalPortal}
                />
                <CreateZip label={tHa('zip')} validationMessages={zipValidation} />
                <HomeAddressCourtesyWithholdingBlock
                  CourtesyWithholding={CreateCourtesyWithholding}
                  formHook={createHomeAddressForm}
                  tHa={tHa}
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
              isLoading={isDeletePending}
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
                  address: formatPendingHomeAddressLine(addressForDeleteModal),
                }}
                components={{
                  strong: <Components.Text weight="medium" as="span" />,
                }}
                tOptions={{ interpolation: { escapeValue: false } }}
              />
            ) : null}
          </Components.Text>
        </Flex>
      </Components.Modal>
    </Flex>
  )
}
