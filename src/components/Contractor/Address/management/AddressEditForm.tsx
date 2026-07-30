import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useContractorAddressForm } from '../shared/useContractorAddressForm'
import type { ContractorAddressOptionalFieldsToRequire } from '../shared/useContractorAddressForm'
import styles from './AddressEditForm.module.scss'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { firstLastName } from '@/helpers/formattedStrings'
import { componentEvents, CONTRACTOR_TYPE } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

// The hook defaults to the API contract, which treats every address field as
// optional. The SDK's address form has always required a complete mailing
// address, so it opts those fields back into being required here.
const SDK_REQUIRED_ADDRESS_FIELDS: ContractorAddressOptionalFieldsToRequire = {
  update: ['street1', 'city', 'state', 'zip'],
}

/**
 * Props for {@link AddressEditForm}.
 *
 * @public
 */
export interface AddressEditFormProps extends BaseComponentInterface<'Contractor.Management.Address'> {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Standalone edit form for a contractor's mailing address.
 *
 * @remarks
 * Renders fields for street address, city, state, and ZIP code — all
 * required — and shows a success alert when the save completes. Save and
 * Cancel both emit events so the parent can return to the read view.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/address/updated` | Fired after the address is successfully saved | The updated `ContractorAddress` entity |
 * | `contractor/management/address/editCancelled` | Fired when the user clicks Cancel | — |
 *
 * @param input - See {@link AddressEditFormProps}.
 * @returns The contractor address edit form.
 * @public
 */
export function AddressEditForm({
  FallbackComponent,
  LoaderComponent,
  ...props
}: AddressEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Address"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <AddressEditFormRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function AddressEditFormRoot({
  contractorId,
  className,
  dictionary,
  onEvent,
  LoaderComponent,
}: AddressEditFormProps) {
  useI18n('Contractor.Management.Address')
  useComponentDictionary('Contractor.Management.Address', dictionary)
  const { t } = useTranslation('Contractor.Management.Address')
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()

  const contractorAddress = useContractorAddressForm({
    contractorId,
    optionalFieldsToRequire: SDK_REQUIRED_ADDRESS_FIELDS,
  })

  const [showSuccess, setShowSuccess] = useState(false)

  if (contractorAddress.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={contractorAddress.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  const { contractor, contractorType } = contractorAddress.data
  const isBusiness = contractorType === CONTRACTOR_TYPE.BUSINESS
  const legalName = isBusiness
    ? (contractor.businessName ?? '')
    : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
  const { Fields } = contractorAddress.form

  const handleSubmit = async () => {
    setShowSuccess(false)
    const result = await contractorAddress.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED, result.data)
    setShowSuccess(true)
  }

  const handleCancel = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_CANCELLED)
  }

  const alert = showSuccess ? (
    <Components.Alert
      status="success"
      label={t('form.successAlert')}
      onDismiss={() => {
        setShowSuccess(false)
      }}
    />
  ) : undefined

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={contractorAddress.errorHandling.errors} LoaderComponent={LoaderComponent}>
        <SDKFormProvider formHookResult={contractorAddress}>
          <Form onSubmit={handleSubmit}>
            {alert}
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h2">{t('form.title')}</Components.Heading>
              <Components.Text variant="supporting">
                {t(isBusiness ? 'form.businessDescription' : 'form.homeDescription', {
                  name: legalName,
                })}
              </Components.Text>
            </Flex>
            <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
              <Fields.Street1
                label={t('form.street1')}
                validationMessages={{ REQUIRED: t('form.validations.street1') }}
              />
              <Fields.Street2 label={t('form.street2')} />
              <Fields.City
                label={t('form.city')}
                validationMessages={{ REQUIRED: t('form.validations.city') }}
              />
              <Fields.State
                label={t('form.state')}
                placeholder={t('form.statePlaceholder')}
                validationMessages={{ REQUIRED: t('form.validations.state') }}
                getOptionLabel={(abbr: string) =>
                  tCommon(`statesHash.${abbr}`, { defaultValue: abbr })
                }
              />
              <Fields.Zip
                label={t('form.zip')}
                validationMessages={{
                  REQUIRED: t('form.validations.zip'),
                  INVALID_ZIP: t('form.validations.zipInvalid'),
                }}
              />
            </Grid>
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel} type="button">
                {t('form.cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={contractorAddress.status.isPending}>
                {t('form.saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
