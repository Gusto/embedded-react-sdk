import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import type { FallbackProps } from 'react-error-boundary'
import styles from './Address.module.scss'
import { useContractorAddressForm } from './shared/useContractorAddressForm'
import type { ContractorAddressOptionalFieldsToRequire } from './shared/useContractorAddressForm'
import type { AddressDefaultValues } from './types'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Form } from '@/components/Common/Form'
import { Flex, Grid, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'
import { contractorEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import { useContractorHasSignedW9 } from '@/components/Contractor/shared/useContractorHasSignedW9'

// The hook defaults to the API contract, which treats every address field as
// optional. The SDK's address form has always required a complete mailing
// address, so it opts those fields back into being required here.
const SDK_REQUIRED_ADDRESS_FIELDS: ContractorAddressOptionalFieldsToRequire = {
  update: ['street1', 'city', 'state', 'zip'],
}

/**
 * Props for {@link Address}.
 *
 * @public
 */
export interface AddressProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Pre-fill values for address fields. Server data takes precedence when the contractor already has an address on file. */
  defaultValues?: AddressDefaultValues
  /** Callback invoked each time the component emits an event. */
  onEvent: OnEventType<EventType, unknown>
  /** Overrides for the component's i18n strings. */
  dictionary?: ResourceDictionary<'Contractor.Address'>
  /** Optional class applied to the wrapping `<section>`. */
  className?: string
  /** Custom React component rendered when an unhandled error is caught by the component-level error boundary. */
  FallbackComponent?: (props: FallbackProps) => JSX.Element
}

/**
 * Form for collecting and updating a contractor's mailing address. Renders a business or home address title based on the contractor type.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/address/updated` | Fired after the address is saved | The updated `ContractorAddress` entity |
 * | `contractor/address/done` | Fired after a successful save so the parent flow can advance | — |
 *
 * @param props - See {@link AddressProps}.
 * @returns The contractor address form.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <ContractorOnboarding.Address
 *       contractorId="contractor-uuid"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function Address({ onEvent, FallbackComponent, ...rootProps }: AddressProps) {
  return (
    <BaseBoundaries componentName="Contractor.Address" FallbackComponent={FallbackComponent}>
      <AddressRoot onEvent={onEvent} {...rootProps} />
    </BaseBoundaries>
  )
}

function ContractorAddressW9Warning({ contractorId }: { contractorId: string }) {
  const hasSignedW9 = useContractorHasSignedW9(contractorId)
  const { t } = useTranslation('Contractor.Address')
  const Components = useComponentContext()
  if (!hasSignedW9) return null
  return (
    <Components.Alert status="warning" disableScrollIntoView label={t('w9EditWarning.label')}>
      <Components.Text>{t('w9EditWarning.body')}</Components.Text>
    </Components.Alert>
  )
}

function AddressRoot({
  contractorId,
  defaultValues,
  onEvent,
  dictionary,
  className,
}: Omit<AddressProps, 'FallbackComponent'>) {
  useComponentDictionary('Contractor.Address', dictionary)
  useI18n('Contractor.Address')
  const { t } = useTranslation('Contractor.Address')
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()

  const contractorAddress = useContractorAddressForm({
    contractorId,
    optionalFieldsToRequire: SDK_REQUIRED_ADDRESS_FIELDS,
    defaultValues,
  })

  if (contractorAddress.isLoading) {
    return <BaseLayout isLoading error={contractorAddress.errorHandling.errors} />
  }

  const { Fields } = contractorAddress.form
  const isBusiness = contractorAddress.data.contractorType === 'Business'

  const handleSubmit = async () => {
    const result = await contractorAddress.actions.onSubmit()
    if (result) {
      onEvent(contractorEvents.CONTRACTOR_ADDRESS_UPDATED, result.data)
      onEvent(contractorEvents.CONTRACTOR_ADDRESS_DONE)
    }
  }

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={contractorAddress.errorHandling.errors}>
        <SDKFormProvider formHookResult={contractorAddress}>
          <Form onSubmit={() => void handleSubmit()}>
            <ContractorAddressW9Warning contractorId={contractorId} />

            <Flex flexDirection="column" gap={32} alignItems="stretch">
              <header>
                <Flex flexDirection="column" gap={4}>
                  <Components.Heading as="h2">
                    {isBusiness ? t('businessAddressTitle') : t('homeAddressTitle')}
                  </Components.Heading>
                  <Components.Text variant="supporting">
                    {isBusiness ? t('businessAddressDescription') : t('homeAddressDescription')}
                  </Components.Text>
                </Flex>
              </header>

              <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
                <Fields.Street1
                  label={t('street1')}
                  validationMessages={{ REQUIRED: t('validations.street1') }}
                />
                <Fields.Street2 label={t('street2')} />
                <Fields.City
                  label={t('city')}
                  validationMessages={{ REQUIRED: t('validations.city') }}
                />
                <Fields.State
                  label={t('state')}
                  placeholder={t('statePlaceholder')}
                  validationMessages={{ REQUIRED: t('validations.state') }}
                  getOptionLabel={(abbr: string) =>
                    tCommon(`statesHash.${abbr}`, { defaultValue: abbr })
                  }
                />
                <Fields.Zip
                  label={t('zip')}
                  validationMessages={{
                    REQUIRED: t('validations.zip'),
                    INVALID_ZIP: t('validations.zipInvalid'),
                  }}
                />
              </Grid>

              <ActionsLayout>
                <Components.Button type="submit" isDisabled={contractorAddress.status.isPending}>
                  {contractorAddress.status.isPending ? t('submitting') : t('submit')}
                </Components.Button>
              </ActionsLayout>
            </Flex>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
