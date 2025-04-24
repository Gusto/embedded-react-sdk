import { Link as AriaLink } from 'react-aria-components'
import classNames from 'classnames'
import type { LinkProps } from './LinkTypes'
import styles from './Link.module.scss'

export function Link({ className, ...props }: LinkProps) {
  return <AriaLink className={classNames(styles.root, className)} {...props} />
}
