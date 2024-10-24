export function handleResponse<T>(
  { response, data, error }: { response: Response; data?: T; error?: unknown },
  opts: { statusCodeOverrides: Record<number, string> } = { statusCodeOverrides: {} },
) {
  if (opts.statusCodeOverrides[response.status])
    throw new ApiError(opts.statusCodeOverrides[response.status], response.status)
  if (response.status < 200 || 299 < response.status) {
    throw new ApiError(`Response was ${String(response.status)}`, response.status, error)
  }
  if (!data) throw new Error('No data returned from API')
  return data
}

export type ApiErrorMessage = {
  category: string
  error_key: string
  message?: string
  errors?: ApiErrorMessage[]
  metadata?: Record<string, string>
}

export class ApiError extends Error {
  errorList: ApiErrorMessage[] | undefined
  constructor(
    message: string,
    public statusCode: number,
    body?: unknown,
  ) {
    super(message)
    this.statusCode = statusCode
    if (body && typeof body === 'object' && 'errors' in body) {
      this.errorList = body.errors as ApiErrorMessage[]
    }
  }
}
