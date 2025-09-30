import { useRef } from 'react'
import { Flex } from '../Flex/Flex'
import styles from './DocumentViewer.module.scss'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
interface DocumentViewerProps {
  url?: string | null
  title?: string
  downloadInstructions?: string
  viewDocumentLabel: string
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function DocumentViewer({
  url,
  title,
  downloadInstructions,
  viewDocumentLabel,
  headingLevel = 'h3',
}: DocumentViewerProps) {
  const Components = useComponentContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const matches = useContainerBreakpoints({
    ref: containerRef,
  })

  const isContainerWidthSmallOrGreater = matches.includes('small')

  if (!url) return null

  const commonEmbeddedPdfProps = {
    src: `${url}#toolbar=0&navpanes=0`,
    title,
    type: 'application/pdf',
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {isContainerWidthSmallOrGreater ? (
        <embed {...commonEmbeddedPdfProps} className={styles.embedPdf} />
      ) : (
        <div className={styles.smallEmbedPdfContainer}>
          <Flex gap={20}>
            <embed {...commonEmbeddedPdfProps} className={styles.smallEmbedPdf} />
            <Flex flexDirection="column" gap={8}>
              <div>
                {title && (
                  <Components.Heading as={headingLevel} className={styles.heading}>
                    {title}
                  </Components.Heading>
                )}
                {downloadInstructions && (
                  <Components.Text className={styles.downloadInstructions}>
                    {downloadInstructions}
                  </Components.Text>
                )}
              </div>
              <Components.Link
                className="react-aria-Button"
                data-variant="secondary"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={`${title || 'document'}.pdf`}
              >
                {viewDocumentLabel}
              </Components.Link>
            </Flex>
          </Flex>
        </div>
      )}
    </div>
  )
}
