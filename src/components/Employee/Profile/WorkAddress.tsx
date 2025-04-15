import { useTranslation } from 'react-i18next'
import styles from './WorkAddress.module.scss'
import { useProfile } from './useProfile'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'

export function WorkAddress() {
  const { t } = useTranslation('Employee.Profile')
  const { isAdmin, workAddresses } = useProfile()

  const activeWorkAddress = workAddresses?.find(address => address.active)

  if (isAdmin || !activeWorkAddress) {
    return null
  }

  return (
    <section>
      <h2>{t('workAddressSectionTitle')}</h2>
      <p>{t('workAddressSectionDescription')}</p>
      <address className={styles.address}>
        <p>{getStreet(activeWorkAddress)}</p>
        <p>{getCityStateZip(activeWorkAddress)}</p>
      </address>
    </section>
  )
}
