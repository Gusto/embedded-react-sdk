import classNames from 'classnames'
import type { HeadingProps } from '@gusto/embedded-react-sdk'
import styles from './Heading.module.scss'

export const Heading = ({
  as: Component,
  styledAs,
  textAlign,
  className,
  children,
  id,
}: HeadingProps) => {
  const levelStyles = styledAs ?? Component

  return (
    <Component
      id={id}
      className={classNames(
        className,
        styles.root,
        styles[levelStyles as string],
        textAlign && styles[`textAlign-${textAlign}`],
      )}
    >
      {children}
    </Component>
  )
}
