import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import type { ReactNode } from 'react'
import styles from './Loading.module.scss'
import { FadeIn } from '@/components/Common/FadeIn/FadeIn'

export interface LoadingProps {
  children?: ReactNode
}

export const Loading = ({ children }: LoadingProps) => {
  const { t } = useTranslation('common')
  return (
    <FadeIn>
      <section
        className={styles.skeletonContainer}
        aria-label={t('status.loading')}
        aria-live="polite"
        aria-busy
      >
        <div className={cn(styles.skeleton, styles.skeletonBox)}>{children}</div>
      </section>
    </FadeIn>
  )
}
