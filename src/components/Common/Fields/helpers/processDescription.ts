import React from 'react'
import { createMarkup } from '@/helpers/formattedStrings'

export const processDescription = (description: React.ReactNode): React.ReactNode => {
  if (!description || typeof description !== 'string') {
    return description
  }

  // Use DOMPurify to sanitize the string and return a React element
  return React.createElement('div', {
    dangerouslySetInnerHTML: createMarkup(description),
  })
}
