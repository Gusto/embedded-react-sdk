/* eslint-disable no-console */
import type { ReadMeCategory, ReadMePage } from '../../shared/types'

interface ProgressCallback {
  (completed: number, total: number, errors: number): void
}

class ReadMeApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public endpoint: string,
  ) {
    super(`ReadMe API Error (${statusCode}): ${message}`)
    this.name = 'ReadMeApiError'
  }
}

class InvalidApiKeyError extends Error {
  constructor() {
    super('Invalid or missing ReadMe API key')
    this.name = 'InvalidApiKeyError'
  }
}

export class ReadMeApiClient {
  private readonly apiKey: string
  private requestCount = 0

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new InvalidApiKeyError()
    }

    this.apiKey = apiKey
  }

  // Core API methods (grouped by function)
  async getCategories(): Promise<ReadMeCategory[]> {
    return this.makeRequest<ReadMeCategory[]>('/categories?page=1&perPage=100')
  }

  async getCategoryPages(categorySlug: string): Promise<ReadMePage[]> {
    return this.makeRequest<ReadMePage[]>(`/categories/${categorySlug}/docs?perPage=100`)
  }

  async getPageDetails(pageSlug: string): Promise<ReadMePage> {
    return this.makeRequest<ReadMePage>(`/docs/${pageSlug}`)
  }

  // Higher-level operations
  async fetchAllPageDetails(
    allReadMePages: Map<string, ReadMePage>,
    onProgress?: ProgressCallback,
  ): Promise<{ errors: number }> {
    const totalPages = allReadMePages.size
    const pageArray = Array.from(allReadMePages.entries())
    let completed = 0
    let errors = 0

    for (const [slug] of pageArray) {
      try {
        const detailedPage = await this.getPageDetails(slug)
        allReadMePages.set(slug, detailedPage)
      } catch (error) {
        errors++
      }

      completed++
      onProgress?.(completed, totalPages, errors)
    }

    return { errors }
  }

  // Static utilities
  static extractAllPages(pages: ReadMePage[]): Map<string, ReadMePage> {
    const allPages = new Map<string, ReadMePage>()

    const extract = (pageList: ReadMePage[]) => {
      for (const page of pageList) {
        allPages.set(page.slug, page)
        if (page.children && page.children.length > 0) {
          extract(page.children)
        }
      }
    }

    extract(pages)
    return allPages
  }

  // Instance utilities
  getRequestCount(): number {
    return this.requestCount
  }

  resetRequestCount(): void {
    this.requestCount = 0
  }

  // Private implementation
  private async makeRequest<T>(endpoint: string): Promise<T> {
    this.requestCount++

    try {
      const response = await fetch(`https://dash.readme.com/api/v1${endpoint}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new ReadMeApiError(response.status, errorText, endpoint)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ReadMeApiError) {
        throw error
      }

      throw new Error(`Failed to fetch ${endpoint}: ${(error as Error).message}`)
    }
  }
}

export function createConsoleProgressReporter(): ProgressCallback {
  return (completed: number, total: number, errors: number) => {
    const percentage = Math.round((completed / total) * 100)
    const errorText = errors > 0 ? ` (${errors} errors)` : ''

    if (completed === total) {
      process.stdout.write('\r')
      console.log(`✓ Fetched details for ${total} pages${errorText}`)
    } else {
      process.stdout.write(
        `\rFetching page details... ${completed}/${total} (${percentage}%)${errorText}`,
      )
    }
  }
}
