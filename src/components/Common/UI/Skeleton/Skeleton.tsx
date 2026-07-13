import type React from 'react'
import classnames from 'classnames'
import styles from './Skeleton.module.scss'
import type { SkeletonProps } from './SkeletonTypes'

const toDimension = (value: string | number) => (typeof value === 'number' ? `${value}px` : value)

/**
 * Shimmering placeholder used to reserve layout space while content loads.
 *
 * @param props - See {@link SkeletonProps}.
 * @returns The rendered placeholder element.
 * @internal
 */
export const Skeleton: React.FC<SkeletonProps> = ({ width, height, className, ...otherProps }) => {
  return (
    <div
      {...otherProps}
      className={classnames(styles.skeleton, className)}
      style={{ width: toDimension(width), height: toDimension(height) }}
      role="status"
      aria-label={otherProps['aria-label'] || 'Loading'}
      aria-busy
      aria-live="polite"
    />
  )
}
