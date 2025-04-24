import type { AnchorHTMLAttributes } from 'react'

export type LinkProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  | 'href'
  | 'target'
  | 'rel'
  | 'download'
  | 'children'
  | 'className'
  | 'id'
  | 'onClick'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'title'
>
