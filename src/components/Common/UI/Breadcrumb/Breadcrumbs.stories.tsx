import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { Crumb } from '@/components/Common/UI/Breadcrumb/BreadcrumbTypes'

export default {
  title: 'UI/Components/Breadcrumbs',
}

export const Default: Story = () => {
  const { Breadcrumbs } = useComponentContext()

  const crumbs: Crumb[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page', isCurrent: true },
  ]

  return <Breadcrumbs crumbs={crumbs} />
}

export const SingleBreadcrumb: Story = () => {
  const { Breadcrumbs } = useComponentContext()

  const crumbs: Crumb[] = [{ label: 'Home', isCurrent: true }]

  return <Breadcrumbs crumbs={crumbs} />
}

export const WithOnClick: Story = () => {
  const { Breadcrumbs } = useComponentContext()

  const crumbs: Crumb[] = [
    {
      label: 'Home',
      href: '/',
      onClick: () => {
        alert('Home clicked')
      },
    },
    {
      label: 'Page',
      href: '/page',
      onClick: () => {
        alert('Page clicked')
      },
    },
    { label: 'Current', isCurrent: true },
  ]

  return <Breadcrumbs crumbs={crumbs} />
}

export const LongBreadcrumbPath: Story = () => {
  const { Breadcrumbs } = useComponentContext()

  const crumbs: Crumb[] = [
    { label: 'Home', href: '/' },
    { label: 'Category', href: '/category' },
    { label: 'Subcategory', href: '/category/subcategory' },
    { label: 'Product Type', href: '/category/subcategory/product-type' },
    { label: 'Brand', href: '/category/subcategory/product-type/brand' },
    { label: 'Product Name', isCurrent: true },
  ]

  return <Breadcrumbs crumbs={crumbs} />
}
