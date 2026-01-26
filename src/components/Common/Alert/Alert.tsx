import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import styles from './Alert.module.scss'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'

export interface AlertConfig {
  content: string
  description?: ReactNode
  status: 'info' | 'success' | 'warning' | 'error'
  icon?: ReactNode
}

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  label?: string
  status?: 'info' | 'success' | 'warning' | 'error'
  children?: ReactNode
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement> & { title?: string }>
  alertConfig?: AlertConfig
}

export function Alert({ label, children, variant, status, icon, alertConfig }: AlertProps) {
  const id = useId()
  const alertRef = useRef<HTMLDivElement>(null)

  const effectiveVariant = alertConfig?.status ?? status ?? variant ?? 'info'
  const effectiveLabel = alertConfig?.content ?? label ?? ''
  const effectiveChildren = alertConfig?.description ?? children

  const IconComponent = icon
    ? icon
    : effectiveVariant === 'info'
      ? InfoIcon
      : effectiveVariant === 'success'
        ? SuccessIcon
        : effectiveVariant === 'warning'
          ? WarningIcon
          : ErrorIcon

  const effectiveIconNode = alertConfig?.icon ?? (icon ? <IconComponent /> : undefined)

  useEffect(() => {
    if (alertRef.current) alertRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div
      className={styles.alert}
      role="alert"
      aria-labelledby={id}
      data-variant={effectiveVariant}
      ref={alertRef}
    >
      <div className={styles.icon}>{effectiveIconNode ?? <IconComponent aria-hidden />}</div>
      <h6 id={id}>{effectiveLabel}</h6>
      <div className={styles.content}>{effectiveChildren}</div>
    </div>
  )
}
