import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Breadcrumbs',
}

export const Default: Story = () => {
  const { Breadcrumb, Breadcrumbs } = useComponentContext()
  return (
    <Breadcrumbs>
      <Breadcrumb href="/">Home</Breadcrumb>
      <Breadcrumb href="/products">Products</Breadcrumb>
      <Breadcrumb isCurrent>Current Page</Breadcrumb>
    </Breadcrumbs>
  )
}

export const SingleBreadcrumb: Story = () => {
  const { Breadcrumb, Breadcrumbs } = useComponentContext()
  return (
    <Breadcrumbs>
      <Breadcrumb isCurrent>Home</Breadcrumb>
    </Breadcrumbs>
  )
}

export const WithOnClick: Story = () => {
  const { Breadcrumb, Breadcrumbs } = useComponentContext()
  return (
    <Breadcrumbs>
      <Breadcrumb
        href="/"
        onClick={() => {
          alert('Home clicked')
        }}
      >
        Home
      </Breadcrumb>
      <Breadcrumb
        href="/page"
        onClick={() => {
          alert('Page clicked')
        }}
      >
        Page
      </Breadcrumb>
      <Breadcrumb isCurrent>Current</Breadcrumb>
    </Breadcrumbs>
  )
}

export const LongBreadcrumbPath: Story = () => {
  const { Breadcrumb, Breadcrumbs } = useComponentContext()
  return (
    <Breadcrumbs>
      <Breadcrumb href="/">Home</Breadcrumb>
      <Breadcrumb href="/category">Category</Breadcrumb>
      <Breadcrumb href="/category/subcategory">Subcategory</Breadcrumb>
      <Breadcrumb href="/category/subcategory/product-type">Product Type</Breadcrumb>
      <Breadcrumb href="/category/subcategory/product-type/brand">Brand</Breadcrumb>
      <Breadcrumb isCurrent>Product Name</Breadcrumb>
    </Breadcrumbs>
  )
}
