import type { AnchorHTMLAttributes } from 'react'
import type { LinkProps as AriaLinkProps } from 'react-aria-components'

export type LinkProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  | 'href'
  | 'target'
  | 'rel'
  | 'download'
  | 'children'
  | 'className'
  | 'id'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'title'
> &
  Pick<AriaLinkProps, 'onClick'>
