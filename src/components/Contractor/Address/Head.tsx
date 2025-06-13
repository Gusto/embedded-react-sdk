import { useTranslation } from 'react-i18next'
import { useAddress } from './useAddress'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Contractor.Address')
  const { contractorType } = useAddress()
  const Components = useComponentContext()

  return (
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
  )
}
