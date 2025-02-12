import { useRef } from 'react'
import { Link } from 'react-aria-components'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { Flex } from '@/components/Common'

import styles from './DocumentViewer.module.scss'

interface DocumentViewerProps {
  url?: string
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
  headingLevel: HeadingLevel = 'h3',
}: DocumentViewerProps) {
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
                {title && <HeadingLevel className={styles.heading}>{title}</HeadingLevel>}
                {downloadInstructions && (
                  <p className={styles.downloadInstructions}>{downloadInstructions}</p>
                )}
              </div>
              <Link
                className="react-aria-Button"
                data-variant="secondary"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={`${title || 'document'}.pdf`}
              >
                {viewDocumentLabel}
              </Link>
            </Flex>
          </Flex>
        </div>
      )}
    </div>
  )
}
