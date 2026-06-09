import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import { JobsListPresentation } from './JobsListPresentation'
import { FlsaStatus } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { mockUseContainerBreakpoints } from '@/test/setup'

const primaryJob = {
  uuid: 'job-1',
  primary: true,
  title: 'Primary Job',
  rate: '50.00',
  paymentUnit: 'Hour',
  currentCompensationUuid: 'comp-1',
  compensations: [
    {
      uuid: 'comp-1',
      title: 'Primary Job',
      flsaStatus: FlsaStatus.NONEXEMPT,
    },
  ],
} as unknown as Job

const additionalJob = {
  uuid: 'job-2',
  primary: false,
  title: 'Additional Job',
  rate: '25.00',
  paymentUnit: 'Hour',
  currentCompensationUuid: 'comp-2',
  compensations: [
    {
      uuid: 'comp-2',
      title: 'Additional Job',
      flsaStatus: FlsaStatus.NONEXEMPT,
    },
  ],
} as unknown as Job

const defaultProps = {
  jobs: [primaryJob],
  primaryFlsaStatus: FlsaStatus.NONEXEMPT as string | undefined,
  isPending: false,
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onContinue: vi.fn(),
}

describe('JobsListPresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base'])
  })

  it('renders the heading and continue button', async () => {
    renderWithProviders(<JobsListPresentation {...defaultProps} />)

    expect(await screen.findByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('renders the data view with job rows', async () => {
    renderWithProviders(
      <JobsListPresentation {...defaultProps} jobs={[primaryJob, additionalJob]} />,
    )

    expect(await screen.findByText('Primary Job')).toBeInTheDocument()
    expect(screen.getByText('Additional Job')).toBeInTheDocument()
  })

  it('shows "Add another job" only when primary FLSA is Nonexempt', async () => {
    renderWithProviders(<JobsListPresentation {...defaultProps} />)

    expect(await screen.findByRole('button', { name: /Add another job/i })).toBeInTheDocument()
  })

  it('does not show "Add another job" when primary FLSA is not Nonexempt', () => {
    renderWithProviders(
      <JobsListPresentation {...defaultProps} primaryFlsaStatus={FlsaStatus.EXEMPT} />,
    )

    expect(screen.queryByRole('button', { name: /Add another job/i })).not.toBeInTheDocument()
  })

  it('does not show "Add another job" when primary FLSA is undefined', () => {
    renderWithProviders(<JobsListPresentation {...defaultProps} primaryFlsaStatus={undefined} />)

    expect(screen.queryByRole('button', { name: /Add another job/i })).not.toBeInTheDocument()
  })

  it('calls onAdd when "Add another job" is clicked', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<JobsListPresentation {...defaultProps} onAdd={onAdd} />)

    await user.click(await screen.findByRole('button', { name: /Add another job/i }))

    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('calls onContinue when Continue is clicked', async () => {
    const onContinue = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<JobsListPresentation {...defaultProps} onContinue={onContinue} />)

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('does not show a delete option for the primary job', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobsListPresentation {...defaultProps} />)

    const cards = await screen.findAllByTestId('data-card')
    const primaryCard = cards.find(card => card.textContent.includes('Primary Job'))!
    await user.click(within(primaryCard).getByRole('button', { name: 'Job actions' }))

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('shows a delete option for non-primary jobs and calls onDelete', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <JobsListPresentation
        {...defaultProps}
        jobs={[primaryJob, additionalJob]}
        onDelete={onDelete}
      />,
    )

    const cards = await screen.findAllByTestId('data-card')
    const additionalCard = cards.find(card => card.textContent.includes('Additional Job'))!
    await user.click(within(additionalCard).getByRole('button', { name: 'Job actions' }))

    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledWith('job-2')
  })

  it('calls onEdit with the job id when Edit is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<JobsListPresentation {...defaultProps} onEdit={onEdit} />)

    const cards = await screen.findAllByTestId('data-card')
    const card = cards[0]!
    await user.click(within(card).getByRole('button', { name: 'Job actions' }))

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onEdit).toHaveBeenCalledWith('job-1')
  })

  it('disables actions while pending', async () => {
    renderWithProviders(<JobsListPresentation {...defaultProps} isPending />)

    expect(await screen.findByRole('button', { name: /Add another job/i })).toBeDisabled()
  })
})
