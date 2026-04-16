import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
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
import { getCityStateZip, getStreet } from '@/helpers/formattedStrings'

export interface HomeAddressViewProps {
  homeAddressForm: UseHomeAddressFormReady
  onSaved: (result: HookSubmitResult<EmployeeAddress>) => void
  onHistoryRowEdit: (address: EmployeeAddress) => void
  onHistoryRowDelete: (address: EmployeeAddress) => void
}

export function HomeAddressView({
  homeAddressForm,
  onSaved,
  onHistoryRowEdit,
  onHistoryRowDelete,
}: HomeAddressViewProps) {
  const { t } = useTranslation('Employee.HomeAddress.Management')
  const { t: tHa } = useTranslation('Employee.HomeAddress')
  const Components = useComponentContext()
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)
  const changeAddressModalContainerRef = useRef<HTMLDivElement>(null)
  const [changeAddressModalPortal, setChangeAddressModalPortal] = useState<HTMLElement | undefined>(
    undefined,
  )

  useLayoutEffect(() => {
    if (!isChangeModalOpen) {
      setChangeAddressModalPortal(undefined)
      return
    }
    const syncPortal = () => {
      setChangeAddressModalPortal(changeAddressModalContainerRef.current ?? undefined)
    }
    syncPortal()
    if (changeAddressModalContainerRef.current == null) {
      const id = requestAnimationFrame(syncPortal)
      return () => {
        cancelAnimationFrame(id)
      }
    }
  }, [isChangeModalOpen])

  const {
    data: { homeAddress, homeAddresses },
    status,
    actions,
    form,
  } = homeAddressForm

  const {
    Fields: { Street1, Street2, City, State, Zip, EffectiveDate },
  } = form

  const zipValidation = {
    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.zip'),
    [HomeAddressErrorCodes.INVALID_ZIP]: tHa('validations.zip'),
  }

  const startDateValidation = {
    [HomeAddressErrorCodes.REQUIRED]: t('form.startDateRequired'),
  }

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
            <Components.Text weight="medium">{getStreet(row).replace(',', '')}</Components.Text>
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
              onHistoryRowEdit(row)
            },
            icon: <PencilSvg aria-hidden />,
          },
          {
            label: t('rowDelete'),
            onClick: () => {
              onHistoryRowDelete(row)
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

  const handleSave = async () => {
    const submitResult = await actions.onSubmit()
    if (submitResult) {
      onSaved(submitResult)
      setIsChangeModalOpen(false)
    }
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8} alignItems="flex-start">
        <Components.Heading as="h1">{t('title')}</Components.Heading>
        <Components.Text variant="supporting">{t('description')}</Components.Text>
      </Flex>

      <Components.Box
        footer={
          <Components.Button
            variant="secondary"
            onClick={() => {
              setIsChangeModalOpen(true)
            }}
            isLoading={status.isPending}
          >
            {t('changeCta')}
          </Components.Button>
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Components.Heading as="h2">{t('currentSectionTitle')}</Components.Heading>
          {homeAddress ? (
            <Flex flexDirection="column" gap={4}>
              <FlexItem>
                <Components.Text weight="medium">
                  {getStreet(homeAddress).replace(',', '')}
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
        </Flex>
      </Components.Box>

      <Flex flexDirection="column" gap={12}>
        <Components.Heading as="h2">{t('historySectionTitle')}</Components.Heading>
        <DataView label={t('historySectionTitle')} {...historyDataView} />
      </Flex>

      <Components.Modal
        isOpen={isChangeModalOpen}
        onClose={() => {
          setIsChangeModalOpen(false)
        }}
        shouldCloseOnBackdropClick={false}
        containerRef={changeAddressModalContainerRef}
        footer={
          <Flex flexDirection="row" gap={12} justifyContent="flex-end">
            <Components.Button
              variant="secondary"
              onClick={() => {
                setIsChangeModalOpen(false)
              }}
            >
              {t('cancelCta')}
            </Components.Button>
            <Components.Button
              variant="primary"
              onClick={() => {
                void handleSave()
              }}
              isLoading={status.isPending}
            >
              {t('submitCta')}
            </Components.Button>
          </Flex>
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Components.Heading as="h2">{t('changeModalTitle')}</Components.Heading>
          <Components.Text variant="supporting">{t('changeModalDescription')}</Components.Text>
          <SDKFormProvider formHookResult={homeAddressForm}>
            <Grid
              gridTemplateColumns={{
                base: '1fr',
                small: '1fr',
              }}
              gap={20}
            >
              {EffectiveDate ? (
                <EffectiveDate
                  label={t('columns.startDate')}
                  description={t('startDateHelper')}
                  validationMessages={startDateValidation}
                  portalContainer={changeAddressModalPortal}
                />
              ) : null}
              <Street1
                label={tHa('street1')}
                validationMessages={{
                  [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                }}
              />
              <Street2
                label={tHa('street2')}
                validationMessages={{
                  [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                }}
              />
              <City
                label={tHa('city')}
                validationMessages={{
                  [HomeAddressErrorCodes.REQUIRED]: tHa('validations.city'),
                }}
              />
              <State
                label={tHa('state')}
                validationMessages={{
                  [HomeAddressErrorCodes.REQUIRED]: tHa('validations.state'),
                }}
                portalContainer={changeAddressModalPortal}
              />
              <Zip label={tHa('zip')} validationMessages={zipValidation} />
            </Grid>
          </SDKFormProvider>
        </Flex>
      </Components.Modal>
    </Flex>
  )
}
