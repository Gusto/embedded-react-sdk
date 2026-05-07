import classNames from 'classnames'
import type { TextProps } from '@gusto/embedded-react-sdk'
import styles from './Text.module.scss'

export const Text = ({
  as: Component = 'p',
  size = 'md',
  textAlign,
  weight,
  className,
  children,
  variant,
  id,
}: TextProps) => {
  return (
    <Component
      id={id}
      className={classNames(
        className,
        styles.root,
        styles[size],
        weight && styles[`weight-${weight}`],
        textAlign && styles[`textAlign-${textAlign}`],
        variant && styles[`variant-${variant}`],
      )}
    >
      {children}
    </Component>
  )
}
