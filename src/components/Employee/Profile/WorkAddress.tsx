import { useProfile } from '@/components/Employee/Profile/Profile'
import { useTranslation } from 'react-i18next'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'

import styles from './WorkAddress.module.scss'

export function WorkAddress() {
  const { t } = useTranslation('Employee.Profile')
  const { flow, workAddresses } = useProfile()

  const activeWorkAddress = workAddresses?.find(address => address.active)

  if (flow !== 'self' || !activeWorkAddress) {
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
