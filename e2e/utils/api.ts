export function getGWSFlowsBase(): string {
  return process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'
}

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${getGWSFlowsBase()}${endpoint}`)
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`API GET ${endpoint} failed (${response.status}): ${errorBody}`)
  }
  return response.json()
}

export async function postApi<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getGWSFlowsBase()}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API POST ${endpoint} failed (${response.status}): ${errorText}`)
  }
  return response.json()
}

export async function putApi<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getGWSFlowsBase()}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API PUT ${endpoint} failed (${response.status}): ${errorText}`)
  }
  return response.json()
}
