import React, { type ComponentProps } from 'react'
import MDXComponents from '@theme-original/MDXComponents'

const Table = (props: ComponentProps<'table'>) => (
  <div className="markdownTableWrapper">
    <table {...props} />
  </div>
)

export default {
  ...MDXComponents,
  table: Table,
}
