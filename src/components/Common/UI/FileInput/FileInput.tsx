import {
  FileTrigger,
  Button as AriaButton,
  DropZone,
  type DropItem,
  type FileDropItem,
} from 'react-aria-components'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { useFieldIds } from '../hooks/useFieldIds'
import type { FileInputProps } from './FileInputTypes'
import { FileInputDefaults } from './FileInputTypes'
import styles from './FileInput.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { FieldLayout } from '@/components/Common/FieldLayout'
import { Flex } from '@/components/Common/Flex'
import { ButtonIcon } from '@/components/Common/UI/Button/ButtonIcon'
import TrashCanIcon from '@/assets/icons/trashcan.svg?react'
import FileIcon from '@/assets/icons/icon-file-outline.svg?react'
import PdfIcon from '@/assets/icons/icon-file-pdf.svg?react'
import PngIcon from '@/assets/icons/icon-file-png.svg?react'
import JpgIcon from '@/assets/icons/icon-file-jpg.svg?react'

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') {
    return PdfIcon
  }

  if (mimeType === 'image/png') {
    return PngIcon
  }

  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return JpgIcon
  }

  return FileIcon
}

function isFileDropItem(item: DropItem): item is FileDropItem {
  return item.kind === 'file'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB'] as const
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(0))
  return `${size} ${sizes[i]}`
}

const mimeToExtension: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/svg+xml': 'SVG',
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
}

function formatAcceptedTypes(accept: string[] | undefined): string | null {
  if (!accept || accept.length === 0 || accept.includes('*/*')) return null

  const extensions = accept
    .map(type => {
      if (type.startsWith('.')) {
        return type.slice(1).toUpperCase()
      }
      return mimeToExtension[type]
    })
    .filter(Boolean)

  if (extensions.length === 0) return null

  const uniqueExtensions = [...new Set(extensions)]
  return uniqueExtensions.join(', ')
}

export function FileInput(rawProps: FileInputProps) {
  const { t } = useTranslation('common')
  const resolvedProps = applyMissingDefaults(rawProps, FileInputDefaults)
  const {
    label,
    description,
    errorMessage,
    isRequired,
    isInvalid,
    isDisabled,
    id,
    value,
    onChange,
    onBlur,
    accept,
    className,
    'aria-describedby': ariaDescribedByFromProps,
  } = resolvedProps

  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
    ariaDescribedBy: ariaDescribedByFromProps,
  })

  const handleSelect = (files: FileList | null) => {
    const file = files?.[0] ?? null
    onChange(file)
  }

  const handleDrop = async (e: { items: DropItem[] }) => {
    const fileItem = e.items.find(isFileDropItem)
    if (fileItem) {
      const file = await fileItem.getFile()
      onChange(file)
    }
  }

  const getDropOperation = (types: { has: (type: string) => boolean }) => {
    const acceptedTypes = accept ?? ['*/*']
    const hasAcceptedType = acceptedTypes.some(type => {
      if (type === '*/*') return true
      if (type.startsWith('.')) {
        return types.has('application/octet-stream') || types.has('Files')
      }
      return types.has(type)
    })
    return hasAcceptedType ? 'copy' : 'cancel'
  }

  const handleRemove = () => {
    onChange(null)
  }

  return (
    <FieldLayout
      label={label}
      errorMessage={errorMessage}
      isRequired={isRequired}
      htmlFor={inputId}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      className={className}
      shouldVisuallyHideLabel
      withErrorIcon={false}
    >
      <div
        className={styles.root}
        data-disabled={isDisabled || undefined}
        data-invalid={isInvalid || undefined}
      >
        {value ? (
          <div
            className={classNames(styles.filePreview, { [styles.disabled as string]: isDisabled })}
          >
            <Flex alignItems="center" gap={12}>
              <div className={styles.fileIcon}>
                {(() => {
                  const Icon = getFileIcon(value.type)
                  return <Icon aria-hidden="true" />
                })()}
              </div>
              <div className={styles.fileInfo}>
                <Flex flexDirection="column" gap={0}>
                  <span className={styles.fileName}>{value.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(value.size)}</span>
                </Flex>
              </div>
              <ButtonIcon
                aria-label={t('fileInput.removeFile')}
                onClick={handleRemove}
                isDisabled={isDisabled}
              >
                <TrashCanIcon aria-hidden="true" className={styles.removeButton} />
              </ButtonIcon>
            </Flex>
          </div>
        ) : (
          <DropZone
            onDrop={handleDrop}
            getDropOperation={getDropOperation}
            className={styles.dropZone}
          >
            <FileTrigger onSelect={handleSelect} acceptedFileTypes={accept}>
              <AriaButton
                id={inputId}
                isDisabled={isDisabled}
                aria-describedby={ariaDescribedBy}
                onBlur={onBlur}
                className={styles.trigger}
              >
                <span className={styles.triggerContent}>
                  <span className={styles.triggerText}>
                    <Trans
                      i18nKey="fileInput.uploadInstructions"
                      ns="common"
                      components={{ clickToUpload: <span className={styles.clickToUpload} /> }}
                    />
                  </span>
                  <span className={styles.hintContainer}>
                    {formatAcceptedTypes(accept) && (
                      <span className={styles.hint}>
                        {t('fileInput.acceptedTypes', { types: formatAcceptedTypes(accept) })}
                      </span>
                    )}
                    {description && (
                      <span id={descriptionId} className={styles.hint}>
                        {description}
                      </span>
                    )}
                  </span>
                </span>
              </AriaButton>
            </FileTrigger>
          </DropZone>
        )}
      </div>
    </FieldLayout>
  )
}
