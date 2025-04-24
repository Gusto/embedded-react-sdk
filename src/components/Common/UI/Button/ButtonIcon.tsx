import { type ButtonIconProps } from './ButtonTypes'
import { Button } from './Button'

export function ButtonIcon(props: ButtonIconProps) {
  return <Button {...props} variant="icon" />
}
