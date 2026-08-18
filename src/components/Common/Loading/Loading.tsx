import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import type { CSSProperties, ReactNode } from 'react'
import styles from './Loading.module.scss'
import { FadeIn } from '@/components/Common/FadeIn/FadeIn'

/** @internal */
export interface LoadingProps {
  children?: ReactNode
  /**
   * Height of the skeleton box, in pixels. Defaults to the standard content
   * height. Injected as the `--loading-height` custom property.
   */
  height?: number
}

/** @internal */
export const Loading = ({ children, height }: LoadingProps) => {
  const { t } = useTranslation('common')
  const style =
    height === undefined ? undefined : ({ '--loading-height': `${height}px` } as CSSProperties)
  return (
    <FadeIn>
      <div
        role="status"
        className={styles.skeletonContainer}
        aria-label={t('status.loading')}
        aria-live="polite"
        aria-busy
      >
        <div className={cn(styles.skeleton, styles.skeletonBox)} style={style}>
          {children}
        </div>
      </div>
    </FadeIn>
  )
}
