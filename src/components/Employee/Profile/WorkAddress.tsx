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
      <p>{t('workAddressSectionDescription')}</p>
      <address className={styles.address}>
        <p>{getStreet(activeWorkAddress)}</p>
        <p>{getCityStateZip(activeWorkAddress)}</p>
      </address>
    </section>
  )
}
