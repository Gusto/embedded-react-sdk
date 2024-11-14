import {
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  type MenuItemProps,
  type MenuProps,
  type MenuTriggerProps,
} from 'react-aria-components'
import HamburgerIcon from '@/assets/icons/hamburger.svg?react'
import { Button } from '@/components/Common'
import { useTheme } from '@/contexts/ThemeProvider/useTheme'

interface HamburgerProps<T> extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {
  title: string
  children: React.ReactNode
}

export function Hamburger<T extends object>({ title, children, ...props }: HamburgerProps<T>) {
  const { container } = useTheme()
  return (
    <MenuTrigger {...props}>
      <Button variant="icon" aria-label={title}>
        <HamburgerIcon />
      </Button>
      <Popover UNSTABLE_portalContainer={container.current ?? undefined}>
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
      <>
        {props.icon && props.icon}
        {props.children}
      </>
    </MenuItem>
  )
}
