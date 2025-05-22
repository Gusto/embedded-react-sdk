import classNames from 'classnames'
import styles from './FieldDescription.module.scss'
import { createMarkup } from '@/helpers/formattedStrings'

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

  return (
    children &&
    (typeof children === 'string' ? (
      <div {...commonProps} dangerouslySetInnerHTML={createMarkup(children)} />
    ) : (
      <div {...commonProps}>{children}</div>
    ))
  )
}
