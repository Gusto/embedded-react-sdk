import { useTranslation } from 'react-i18next'
import styles from './WorkAddress.module.scss'
import { useProfile } from './useProfile'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function WorkAddress() {
  const { t } = useTranslation('Employee.Profile')
  const { isAdmin, workAddresses } = useProfile()
  const Components = useComponentContext()

  const activeWorkAddress = workAddresses?.find(address => address.active)

  if (isAdmin || !activeWorkAddress) {
    return null
  }

  return (
    <section>
      <Components.Heading as="h2">{t('workAddressSectionTitle')}</Components.Heading>
      <Components.Text>{t('workAddressSectionDescription')}</Components.Text>
      <address className={styles.address}>
        <Components.Text>{getStreet(activeWorkAddress)}</Components.Text>
        <Components.Text>{getCityStateZip(activeWorkAddress)}</Components.Text>
      </address>
    </section>
  )
}
