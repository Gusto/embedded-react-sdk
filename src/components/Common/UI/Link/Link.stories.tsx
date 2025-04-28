import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Link',
}

export const Default = () => {
  const Components = useComponentContext()
  return <Components.Link href="https://example.com">This is a default link</Components.Link>
}

export const ExternalLink = () => {
  const Components = useComponentContext()
  return (
    <Components.Link href="https://example.com" target="_blank" rel="noopener noreferrer">
      External link (opens in new tab)
    </Components.Link>
  )
}

export const DownloadLink = () => {
  const Components = useComponentContext()
  return (
    <Components.Link href="#" download="example.txt">
      Download file
    </Components.Link>
  )
}
