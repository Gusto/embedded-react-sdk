import {
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  type MenuItemProps,
  type MenuProps,
  type MenuTriggerProps,
} from 'react-aria-components'
import styles from './Hamburger.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
import HamburgerIcon from '@/assets/icons/hamburger.svg?react'
import { useTheme } from '@/contexts/ThemeProvider'
import Spinner from '@/assets/icons/spinner_small.svg?react'

interface HamburgerProps<T> extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {
  title: string
  isPending?: boolean
  children: React.ReactNode
}

export function Hamburger<T extends object>({
  title,
  children,
  isPending,
  ...props
}: HamburgerProps<T>) {
  const { container } = useTheme()
  const Components = useComponentContext()
  if (isPending) return <Spinner title="Loading" />
  return (
    <MenuTrigger {...props}>
      <Components.ButtonIcon aria-label={title}>
        <HamburgerIcon />
      </Components.ButtonIcon>
      <Popover UNSTABLE_portalContainer={container.current}>
        <Menu {...props}>{children}</Menu>
      </Popover>
    </MenuTrigger>
  )
}
export function HamburgerItem(props: MenuItemProps & { icon?: React.ReactNode }) {
  const textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined)
  return (
    <MenuItem {...props} textValue={textValue}>
      {typeof props.children === 'function' ? (
        props.children
      ) : (
        <span>
          {props.icon && <div className={styles.menuIcon}>{props.icon}</div>}
          {props.children}
        </span>
      )}
    </MenuItem>
  )
}
