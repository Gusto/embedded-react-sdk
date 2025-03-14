import cn from 'classnames'
import styles from './Loading.module.scss'

export const Loading = () => {
  return (
    <section className={styles.skeletonContainer} aria-live="polite" aria-busy>
      <div className={cn(styles.skeleton, styles.skeletonBox)}></div>
    </section>
  )
}
