//TODO: unused at the moment - might be stale
import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Button, Flex } from '@/components/Common'
import { useFlow, type CompanyOnboardingContextInterface } from '@/components/Flow'
import { addressInline } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useGetCompanyAddresses } from '@/api/queries/company'
import { GustoClient } from '@fern-api/gusto'

interface AddressesProps {
  companyId: string
}

export const Addresses = (props: AddressesProps & BaseComponentInterface) => {
  const { onEvent, companyId } = props
  useI18n('Company.Addresses')
  const { t } = useTranslation('Company.Addresses')

  const { data: addresses, isPending } = useGetCompanyAddresses(companyId)

  // const systemClient = new GustoClient({ auth: { token: "" type: "token" }})
  // systemClient.token.getInfo()
  // const { accessToken } = await systemClient.companies.create({
  //   user: { firstName: 'Frank', lastName: 'Ocean', email: 'focean@test.com' }, company: { name: 'cool company' }})
  
  //   if (accessToken) {
  //     const companyClient =  new GustoClient({ auth: { token: accessToken, type: "token" }})
  //     companyClient.companies.employees.create()
  //   }


  return (
    <BaseComponent {...props}>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      {addresses.map(address => (
        <Flex key={address.uuid}>
          {addressInline(address)}
          <Button
            variant="secondary"
            onPress={() => {
              onEvent(componentEvents.COMPANY_ADDRESSE_EDIT, address)
            }}
          >
            {t('editCta')}
          </Button>
        </Flex>
      ))}
      <Flex>
        <Button
          variant="secondary"
          onPress={() => {
            // onEvent(componentEvents.CANCEL);
          }}
        >
          {t('addCta')}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {t('continueCta')}
        </Button>
      </Flex>
    </BaseComponent>
  )
}

export const AddressesContextual = () => {
  const { companyId, onEvent } = useFlow<CompanyOnboardingContextInterface>()
  const { t } = useTranslation()

  if (!companyId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Addresses',
        param: 'companyId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Addresses companyId={companyId} onEvent={onEvent} />
}
