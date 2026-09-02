import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import type { LoaderComponentType } from '@/components/Base/Base'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetWireInRequests, createWireInRequest } from '@/test/mocks/apis/wire_in_requests'
import { handleGetPayrolls } from '@/test/mocks/apis/payrolls'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const captured = vi.hoisted(() => ({
  loaderComponent: undefined as LoaderComponentType | undefined,
}))

vi.mock('./ConfirmWireDetailsBanner', () => ({
  ConfirmWireDetailsBanner: (props: { LoaderComponent?: LoaderComponentType }) => {
    captured.loaderComponent = props.LoaderComponent
    return <div>banner mock</div>
  },
}))

// Imported after the mock is declared so ConfirmWireDetails picks up the mocked banner.
const { ConfirmWireDetails } = await import('./ConfirmWireDetails')

describe('ConfirmWireDetails', () => {
  beforeEach(() => {
    setupApiTestMocks()
    vi.clearAllMocks()
    captured.loaderComponent = undefined
  })

  it('forwards its LoaderComponent to the banner', async () => {
    server.use(handleGetWireInRequests(() => HttpResponse.json([createWireInRequest()])))
    server.use(handleGetPayrolls(() => HttpResponse.json([])))

    const loader: LoaderComponentType = () => <div data-testid="wire-loader" />
    renderWithProviders(
      <ConfirmWireDetails companyId="company-123" onEvent={vi.fn()} LoaderComponent={loader} />,
    )

    expect(await screen.findByText('banner mock')).toBeInTheDocument()
    expect(captured.loaderComponent).toBe(loader)
  })
})
