import classNames from 'classnames'
import styles from './FieldDescription.module.scss'

interface FieldDescriptionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export const FieldDescription: React.FC<FieldDescriptionProps> = ({
  children,
  className,
  ...props
}: FieldDescriptionProps) => {
  return (
    children && (
      <div {...props} className={classNames(styles.root, className)}>
        {children}
      </div>
    )
  )
}
