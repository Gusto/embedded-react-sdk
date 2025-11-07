import { describe, test, expect } from 'vitest'
import React from 'react'
import { processDescription } from './processDescription'

describe('processDescription', () => {
  test('should return non-string descriptions as-is', () => {
    const jsxElement = <span>JSX element</span>
    const result = processDescription(jsxElement)

    expect(result).toBe(jsxElement)
  })

  test('should return null/undefined descriptions as-is', () => {
    expect(processDescription(null)).toBeNull()
    expect(processDescription(undefined)).toBeUndefined()
  })

  test('should process plain text strings as React elements with sanitized content', () => {
    const plainText = 'Plain text description'
    const result = processDescription(plainText)

    const element = result as React.ReactElement<{
      dangerouslySetInnerHTML: { __html: string }
    }>
    expect(React.isValidElement(element)).toBe(true)
    expect(element.props.dangerouslySetInnerHTML.__html).toBe(plainText)
  })

  test('should process HTML strings and preserve safe HTML tags', () => {
    const result = processDescription(
      'Text with <b>bold</b> and <a href="https://example.com">link</a>',
    )

    const element = result as React.ReactElement<{
      dangerouslySetInnerHTML: { __html: string }
    }>
    expect(React.isValidElement(element)).toBe(true)
    expect(element.props.dangerouslySetInnerHTML.__html).toBe(
      'Text with <b>bold</b> and <a href="https://example.com">link</a>',
    )
  })

  test('should sanitize dangerous HTML content and remove script tags', () => {
    const result = processDescription('Safe text <script>alert("XSS")</script> more text')

    const element = result as React.ReactElement<{
      dangerouslySetInnerHTML: { __html: string }
    }>
    expect(React.isValidElement(element)).toBe(true)
    expect(element.props.dangerouslySetInnerHTML.__html).toBe('Safe text  more text')
    expect(element.props.dangerouslySetInnerHTML.__html).not.toContain('<script>')
  })

  test('should remove unsafe attributes from allowed tags', () => {
    const result = processDescription(
      'Text with <a href="https://example.com" onclick="alert(\'XSS\')">link</a>',
    )

    const element = result as React.ReactElement<{
      dangerouslySetInnerHTML: { __html: string }
    }>
    expect(React.isValidElement(element)).toBe(true)
    expect(element.props.dangerouslySetInnerHTML.__html).toBe(
      'Text with <a href="https://example.com">link</a>',
    )
    expect(element.props.dangerouslySetInnerHTML.__html).not.toContain('onclick')
  })
})
