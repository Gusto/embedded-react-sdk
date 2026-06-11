import React, { type ReactNode } from 'react'
import type { Props } from '@theme/Icon/Menu'

export default function IconMenu({
  width = 18,
  height = 18,
  className,
  ...restProps
}: Props): ReactNode {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...restProps}
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}
