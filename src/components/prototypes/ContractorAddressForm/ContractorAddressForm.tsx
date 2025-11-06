import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ContractorAddressFormProvider } from './ContractorAddressFormProvider'
import { useContractorAddressForm, ContractorAddressFormSchema } from './useContractorAddressForm'
import type { ContractorAddressFormValues } from './useContractorAddressForm'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useI18n, useComponentDictionary } from '@/i18n'
import { Flex, TextInputField, SelectField, Grid } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseUIComponent } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { contractorEvents, STATES_ABBR } from '@/shared/constants'
import { useBase } from '@/components/Base/useBase'

export interface ContractorAddressProps extends BaseComponentInterface<'Contractor.Address'> {
  contractorId: string
  defaultValues?: ContractorAddressFormValues
  children?: ReactNode
  className?: string
}

function ContractorAddress({ defaultValues, ...props }: ContractorAddressProps) {
  return (
    <ContractorAddressFormProvider {...props}>
      <BaseUIComponent>
        <Root defaultValues={defaultValues} {...props} />
      </BaseUIComponent>
    </ContractorAddressFormProvider>
  )
}

function Root({ defaultValues, children, className, dictionary }: ContractorAddressProps) {
  useComponentDictionary('Contractor.Address', dictionary)
  useI18n('Contractor.Address')

  const {
    contractor,
    defaultValues: formDefaultValues,
    isUpdating,
    onSubmit,
  } = useContractorAddressForm()
  const contractorType = contractor?.type

  const Components = useComponentContext()
  const { onEvent } = useBase()

  const { t } = useTranslation('Contractor.Address')

  const composedDefaultValues = {
    street1: formDefaultValues.street1 || defaultValues?.street1,
    street2: formDefaultValues.street2 || defaultValues?.street2,
    city: formDefaultValues.city || defaultValues?.city,
    state: formDefaultValues.state || defaultValues?.state,
    zip: formDefaultValues.zip || defaultValues?.zip,
  }

  const formMethods = useForm<ContractorAddressFormValues>({
    resolver: zodResolver(ContractorAddressFormSchema),
    defaultValues: composedDefaultValues,
  })

  const handleSubmit = async (values: ContractorAddressFormValues) => {
    const { updatedContractorAddressResponse } = await onSubmit(values)

    if (updatedContractorAddressResponse) {
      onEvent(
        contractorEvents.CONTRACTOR_ADDRESS_UPDATED,
        updatedContractorAddressResponse.contractorAddress,
      )
      onEvent(contractorEvents.CONTRACTOR_ADDRESS_DONE)
    }
  }

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Flex flexDirection="column" gap={32}>
            {children ? (
              children
            ) : (
              <>
                <header>
                  <Components.Heading as="h2">
                    {contractorType === 'Business'
                      ? t('businessAddressTitle')
                      : t('homeAddressTitle')}
                  </Components.Heading>
                  <Components.Text>
                    {contractorType === 'Business'
                      ? t('businessAddressDescription')
                      : t('homeAddressDescription')}
                  </Components.Text>
                </header>

                <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
                  <TextInputField
                    name="street1"
                    label={t('street1')}
                    isRequired
                    errorMessage={t('validations.street1')}
                  />
                  <TextInputField name="street2" label={t('street2')} />
                  <TextInputField
                    name="city"
                    label={t('city')}
                    isRequired
                    errorMessage={t('validations.city')}
                  />
                  <SelectField
                    name="state"
                    options={STATES_ABBR.map(stateAbbr => ({
                      label: t(`statesHash.${stateAbbr}`, {
                        ns: 'common',
                        defaultValue: stateAbbr,
                      }),
                      value: stateAbbr,
                    }))}
                    label={t('state')}
                    placeholder={t('statePlaceholder')}
                    errorMessage={t('validations.state')}
                    isRequired
                  />
                  <TextInputField
                    name="zip"
                    label={t('zip')}
                    isRequired
                    errorMessage={t('validations.zip')}
                  />
                </Grid>

                <ActionsLayout>
                  <Components.Button type="submit" isLoading={isUpdating}>
                    {t('submit')}
                  </Components.Button>
                </ActionsLayout>
              </>
            )}
          </Flex>
        </HtmlForm>
      </FormProvider>
    </section>
  )
}

export default ContractorAddress
