import type { CSSProperties } from 'react'
import cn from 'classnames'
import styles from './Skeleton.module.scss'

interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  className?: string
}

export function Skeleton({ width, height, className }: SkeletonProps) {
  return (
    <div className={cn(styles.skeleton, className)} style={{ width, height }} aria-hidden="true" />
  )
}
