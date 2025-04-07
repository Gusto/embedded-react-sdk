import classNames from 'classnames'
import styles from './FieldErrorMessage.module.scss'

interface FieldErrorMessageProps {
  children: React.ReactNode
  id: string
  className?: string
}

export function FieldErrorMessage({ children, id, className }: FieldErrorMessageProps) {
  return (
    children && (
      <div id={id} className={classNames(styles.root, className)}>
        {children}
      </div>
    )
  )
}
