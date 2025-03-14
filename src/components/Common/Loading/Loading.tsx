import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import styles from './Loading.module.scss'

export const Loading = () => {
  const { t } = useTranslation('common')
  return (
    <section
      className={styles.skeletonContainer}
      aria-label={t('status.loading')}
      aria-live="polite"
      aria-busy
    >
      <div className={cn(styles.skeleton, styles.skeletonBox)}></div>
    </section>
  )
}
