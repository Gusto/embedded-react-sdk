import React, { type ComponentProps } from 'react'
import MDXComponents from '@theme-original/MDXComponents'
import DocCardList from '@theme/DocCardList'

const Table = (props: ComponentProps<'table'>) => (
  <div className="markdownTableWrapper">
    <table {...props} />
  </div>
)

export default {
  ...MDXComponents,
  table: Table,
  DocCardList,
}
