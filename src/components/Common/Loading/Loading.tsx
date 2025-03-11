import clsx from 'clsx'
import styles from './Loading.module.scss'

export const Loading = () => {
  return (
    <div className={styles.skeletonContainer} aria-live="polite" aria-busy>
      <div className={clsx(styles.skeleton, styles.skeletonBox)}></div>
    </div>
  )
}
