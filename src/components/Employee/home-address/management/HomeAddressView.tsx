import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { HomeAddressErrorCodes } from '@/components/Employee/Profile/shared/useHomeAddressForm/homeAddressSchema'
import type { UseHomeAddressFormReady } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { DataView, useDataView } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { getCityStateZip, getStreet } from '@/helpers/formattedStrings'

export interface HomeAddressViewProps {
  homeAddressForm: UseHomeAddressFormReady
  onBack: () => void
  onSaved: (result: HookSubmitResult<EmployeeAddress>) => void
}

export function HomeAddressView({ homeAddressForm, onBack, onSaved }: HomeAddressViewProps) {
  const { t } = useTranslation('Employee.HomeAddress.Management')
  const { t: tHa } = useTranslation('Employee.HomeAddress')
  const Components = useComponentContext()
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)

  const {
    data: { homeAddress, homeAddresses },
    status,
    actions,
    form,
  } = homeAddressForm

  const {
    Fields: { Street1, Street2, City, State, Zip, CourtesyWithholding, EffectiveDate },
  } = form

  const zipValidation = {
    [HomeAddressErrorCodes.REQUIRED]: tHa('validations.zip'),
    [HomeAddressErrorCodes.INVALID_ZIP]: tHa('validations.zip'),
  }

  const effectiveDateValidation = {
    [HomeAddressErrorCodes.REQUIRED]: t('form.effectiveDateRequired'),
  }

  const sortedHistory = [...(homeAddresses ?? [])].sort((a, b) => {
    const aDate = a.effectiveDate?.toString() ?? ''
    const bDate = b.effectiveDate?.toString() ?? ''
    return bDate.localeCompare(aDate)
  })

  const historyDataView = useDataView({
    data: sortedHistory,
    columns: [
      {
        title: t('columns.address'),
        render: (row: EmployeeAddress) => getStreet(row).replace(',', ''),
      },
      {
        title: t('columns.location'),
        render: (row: EmployeeAddress) => getCityStateZip(row),
      },
      {
        title: t('columns.effectiveDate'),
        render: (row: EmployeeAddress) =>
          row.effectiveDate ? formatDateLongWithYear(row.effectiveDate.toString()) : '—',
      },
      {
        title: t('columns.status'),
        render: (row: EmployeeAddress) => (
          <Components.Badge status={row.active ? 'success' : 'info'}>
            {row.active ? t('status.active') : t('status.inactive')}
          </Components.Badge>
        ),
      },
    ],
    emptyState: () => <Components.Text>{t('historyEmpty')}</Components.Text>,
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
        <Components.Button variant="secondary" onClick={onBack}>
          {t('backCta')}
        </Components.Button>
        <Components.Heading as="h1">{t('title')}</Components.Heading>
      </Flex>

      <Components.Box header={<Components.BoxHeader title={t('currentSectionTitle')} />}>
        <Flex flexDirection="column" gap={16}>
          {homeAddress ? (
            <Flex flexDirection="column" gap={0}>
              <Components.Text variant="supporting">{tHa('street1')}</Components.Text>
              <Components.Text>{getStreet(homeAddress).replace(',', '')}</Components.Text>
              <Components.Text>{getCityStateZip(homeAddress)}</Components.Text>
            </Flex>
          ) : (
            <Components.Text>{tHa('formTitle')}</Components.Text>
          )}
          <Components.Button
            variant="primary"
            onClick={() => {
              setIsChangeModalOpen(true)
            }}
            isLoading={status.isPending}
          >
            {t('changeCta')}
          </Components.Button>
        </Flex>
      </Components.Box>

      <Components.Box header={<Components.BoxHeader title={t('historySectionTitle')} />}>
        <DataView label={t('historySectionTitle')} isWithinBox {...historyDataView} />
      </Components.Box>

      <Components.Modal
        isOpen={isChangeModalOpen}
        onClose={() => {
          setIsChangeModalOpen(false)
        }}
        shouldCloseOnBackdropClick={false}
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
          <Components.Text>{tHa('desc')}</Components.Text>
          <SDKFormProvider formHookResult={homeAddressForm}>
            <Grid
              gridTemplateColumns={{
                base: '1fr',
                small: ['1fr', '1fr'],
              }}
              gap={20}
            >
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
              />
              <Zip label={tHa('zip')} validationMessages={zipValidation} />
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
                validationMessages={{
                  [HomeAddressErrorCodes.REQUIRED]: tHa('validations.street1'),
                }}
              />
              {EffectiveDate ? (
                <EffectiveDate
                  label={tHa('effectiveDate')}
                  validationMessages={effectiveDateValidation}
                />
              ) : null}
            </Grid>
          </SDKFormProvider>
        </Flex>
      </Components.Modal>
    </Flex>
  )
}
