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
  id,
}: FieldDescriptionProps) => {
  const commonProps = {
    className: classNames(styles.root, className),
    id,
  }

  return children && <div {...commonProps}>{children}</div>
}
