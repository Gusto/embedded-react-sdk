import { useTranslation } from 'react-i18next'
import { ContractorAddressFormProvider } from './ContractorAddressFormProvider'
import { useContractorAddressForm } from './useContractorAddressForm'
import type { ContractorAddressFormDefaultValues } from './useContractorAddressForm'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useI18n, useComponentDictionary } from '@/i18n'
import { Flex, Grid } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseUIComponent } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { contractorEvents } from '@/shared/constants'
import { useBase } from '@/components/Base/useBase'

export interface ContractorAddressFormProps extends BaseComponentInterface<'Contractor.Address'> {
  contractorId: string
  defaultValues?: ContractorAddressFormDefaultValues
  className?: string
}

function ContractorAddressForm(props: ContractorAddressFormProps) {
  return (
    <ContractorAddressFormProvider {...props}>
      <BaseUIComponent>
        <Root {...props} />
      </BaseUIComponent>
    </ContractorAddressFormProvider>
  )
}

function Root({ className, dictionary }: ContractorAddressFormProps) {
  useComponentDictionary('Contractor.Address', dictionary)
  useI18n('Contractor.Address')

  const { Fields, contractor, isUpdating, onSubmit } = useContractorAddressForm()
  const contractorType = contractor?.type

  const Components = useComponentContext()
  const { onEvent } = useBase()

  const { t } = useTranslation('Contractor.Address')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { updatedContractorAddressResponse } = await onSubmit()

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
      <HtmlForm onSubmit={handleSubmit}>
        <Flex flexDirection="column" gap={32}>
          <header>
            <Components.Heading as="h2">
              {contractorType === 'Business' ? t('businessAddressTitle') : t('homeAddressTitle')}
            </Components.Heading>
            <Components.Text>
              {contractorType === 'Business'
                ? t('businessAddressDescription')
                : t('homeAddressDescription')}
            </Components.Text>
          </header>
          <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
            <Fields.Street1
              label={t('street1')}
              validationMessages={{
                required: t('validations.street1'),
              }}
            />
            <Fields.Street2 label={t('street2')} />
            <Fields.City
              label={t('city')}
              validationMessages={{
                required: t('validations.city'),
              }}
            />
            <Fields.State
              label={t('state')}
              validationMessages={{
                required: t('validations.state'),
              }}
              getOptionLabel={value =>
                t(`statesHash.${value}`, { ns: 'common', defaultValue: value })
              }
            />
            <Fields.State
              label={t('state')}
              validationMessages={{
                required: t('validations.state'),
              }}
              getOptionLabel={value =>
                t(`statesHash.${value}`, { ns: 'common', defaultValue: value })
              }
              renderInput={({
                options,
                name,
                onChange,
                value,
                isInvalid,
                errorMessage,
                inputRef,
              }) => {
                return (
                  <div>
                    <fieldset
                      ref={inputRef}
                      style={{
                        border: isInvalid ? '2px solid red' : '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '16px',
                      }}
                    >
                      <legend style={{ fontWeight: 'bold', padding: '0 8px' }}>{t('state')}</legend>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: '8px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {options.map(option => (
                          <label
                            key={option.value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="radio"
                              value={option.value}
                              name={name}
                              checked={value === option.value}
                              onChange={e => {
                                onChange(e.target.value)
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {isInvalid && errorMessage && (
                      <div
                        style={{
                          color: 'red',
                          fontSize: '14px',
                          marginTop: '4px',
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}
                  </div>
                )
              }}
            />
            <Fields.Zip
              label={t('zip')}
              validationMessages={{
                required: t('validations.zip'),
              }}
            />
          </Grid>
          <ActionsLayout>
            <Components.Button type="submit" isLoading={isUpdating}>
              {t('submit')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </section>
  )
}

export default ContractorAddressForm
