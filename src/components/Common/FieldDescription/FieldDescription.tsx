import classNames from 'classnames'
import styles from './FieldDescription.module.scss'

interface FieldDescriptionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

/**
 * Renders a field's helper description text beneath its label.
 *
 * @internal
 */
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
