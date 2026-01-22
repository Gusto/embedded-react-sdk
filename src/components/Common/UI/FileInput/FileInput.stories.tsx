import { useState } from 'react'
import { FileInput } from './FileInput'

export default {
  title: 'UI/Form/Inputs/FileInput',
}

export const Default = () => {
  const [file, setFile] = useState<File | null>(null)
  return <FileInput label="Upload document" value={file} onChange={setFile} />
}

export const WithAcceptedTypes = () => {
  const [file, setFile] = useState<File | null>(null)
  return (
    <FileInput
      label="Upload document"
      value={file}
      onChange={setFile}
      accept={['image/jpeg', 'image/png', 'application/pdf']}
    />
  )
}

export const WithFileSelected = () => {
  const mockFile = new File(['test content'], 'ALee_Passport.pdf', {
    type: 'application/pdf',
  })
  Object.defineProperty(mockFile, 'size', { value: 658432 })

  const [file, setFile] = useState<File | null>(mockFile)
  return (
    <FileInput
      label="Upload document"
      value={file}
      onChange={setFile}
      accept={['image/jpeg', 'image/png', 'application/pdf']}
    />
  )
}

export const WithError = () => {
  const [file, setFile] = useState<File | null>(null)
  return (
    <FileInput
      label="Upload document"
      value={file}
      onChange={setFile}
      accept={['image/jpeg', 'image/png', 'application/pdf']}
      isInvalid
      errorMessage="This field is required"
    />
  )
}

export const Disabled = () => {
  const [file, setFile] = useState<File | null>(null)
  return <FileInput label="Upload document" value={file} onChange={setFile} isDisabled />
}

export const DisabledWithFile = () => {
  const mockFile = new File(['test content'], 'ALee_Passport.pdf', {
    type: 'application/pdf',
  })
  Object.defineProperty(mockFile, 'size', { value: 658432 })

  const [file, setFile] = useState<File | null>(mockFile)
  return <FileInput label="Upload document" value={file} onChange={setFile} isDisabled />
}

export const WithDescription = () => {
  const [file, setFile] = useState<File | null>(null)
  return (
    <FileInput
      label="Upload document"
      description="Maximum file size: 10MB"
      value={file}
      onChange={setFile}
      accept={['image/jpeg', 'image/png', 'application/pdf']}
    />
  )
}

export const InContainer = () => {
  const [file, setFile] = useState<File | null>(null)
  return (
    <div style={{ maxWidth: 400, border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
      <FileInput
        label="Upload document"
        value={file}
        onChange={setFile}
        accept={['image/jpeg', 'image/png', 'application/pdf']}
      />
    </div>
  )
}
