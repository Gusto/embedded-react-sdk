import type { CSSProperties, PropsWithChildren } from 'react'
import { GustoProvider, SDKFormProvider, usePayScheduleForm } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { Button, Loading, interfaceLibComponents } from '../InterfaceLib'
import { BASE_URL, COMPANY_ID } from './config'

const pageStyle: CSSProperties = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '32px 16px',
  fontFamily: "'InterfaceLib Sans', system-ui, sans-serif",
}

const layoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)',
  gap: '24px',
  alignItems: 'start',
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)',
  border: '1px solid #e4e7ec',
}

const cardTitleStyle: CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '20px',
  fontWeight: 600,
  color: '#101828',
}

const cardDescriptionStyle: CSSProperties = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: '#475467',
}

const fieldStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '24px',
}

const previewListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
}

const previewItemStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  rowGap: '4px',
  columnGap: '12px',
  padding: '12px 14px',
  borderRadius: '8px',
  background: '#f9fafb',
  border: '1px solid #e4e7ec',
  fontSize: '13px',
  color: '#101828',
}

const previewPeriodLabelStyle: CSSProperties = {
  fontWeight: 600,
}

const previewMetaStyle: CSSProperties = {
  color: '#475467',
  fontVariantNumeric: 'tabular-nums',
}

const previewBadgeStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '2px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  background: '#eef4ff',
  color: '#175cd3',
}

const placeholderStyle: CSSProperties = {
  padding: '16px',
  borderRadius: '8px',
  background: '#f9fafb',
  border: '1px dashed #d0d5dd',
  color: '#475467',
  fontSize: '13px',
  lineHeight: 1.5,
}

const formActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
}

function Card({ children }: PropsWithChildren) {
  return <section style={cardStyle}>{children}</section>
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value: unknown): string {
  const iso = typeof value === 'string' ? value : (value as { toString(): string }).toString()
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return dateFormatter.format(date)
}

function PayScheduleForm() {
  const paySchedule = usePayScheduleForm({ companyId: COMPANY_ID })

  if (paySchedule.isLoading) return <Loading />

  const { Fields } = paySchedule.form
  const { payPeriodPreview, payPreviewLoading } = paySchedule.data
  const upcoming = payPeriodPreview?.slice(0, 4) ?? []

  return (
    <SDKFormProvider formHookResult={paySchedule}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void (async () => {
            const result = await paySchedule.actions.onSubmit()
            console.log('[HooksPayScheduleDemo] pay schedule submit complete:', result)
          })()
        }}
      >
        <div style={layoutStyle}>
          <Card>
            <h2 style={cardTitleStyle}>Pay schedule</h2>
            <div style={fieldStackStyle}>
              <Fields.CustomName
                label="Schedule name"
                validationMessages={{ REQUIRED: 'Schedule name is required' }}
              />
              <Fields.Frequency
                label="Pay frequency"
                validationMessages={{ REQUIRED: 'Pay frequency is required' }}
              />
              {Fields.CustomTwicePerMonth && (
                <Fields.CustomTwicePerMonth
                  label="Twice-per-month schedule"
                  validationMessages={{ REQUIRED: 'Choose a twice-per-month schedule' }}
                />
              )}
              <Fields.AnchorPayDate
                label="First pay date"
                validationMessages={{ REQUIRED: 'First pay date is required' }}
              />
              <Fields.AnchorEndOfPayPeriod
                label="End of first pay period"
                validationMessages={{ REQUIRED: 'End of first pay period is required' }}
              />
              {Fields.Day1 && (
                <Fields.Day1
                  label="First pay day of the month"
                  validationMessages={{
                    REQUIRED: 'First pay day is required',
                    DAY_RANGE: 'Enter a day between 1 and 31',
                  }}
                />
              )}
              {Fields.Day2 && (
                <Fields.Day2
                  label="Second pay day of the month"
                  validationMessages={{
                    REQUIRED: 'Second pay day is required',
                    DAY_RANGE: 'Enter a day between 1 and 31',
                  }}
                />
              )}
            </div>
            <div style={formActionsStyle}>
              <Button type="submit" isLoading={paySchedule.status.isPending}>
                Save schedule
              </Button>
            </div>
          </Card>

          <Card>
            <h2 style={cardTitleStyle}>Upcoming pay periods</h2>
            {payPreviewLoading && <div style={placeholderStyle}>Loading preview…</div>}
            {!payPreviewLoading && upcoming.length === 0 && (
              <div style={placeholderStyle}>
                Fill in the first pay date and end of pay period to see a preview.
              </div>
            )}
            {!payPreviewLoading && upcoming.length > 0 && (
              <ol style={previewListStyle}>
                {upcoming.map((period, index) => (
                  <li key={`${period.checkDate.toString()}-${index}`} style={previewItemStyle}>
                    <span style={previewPeriodLabelStyle}>
                      {formatDate(period.startDate)} – {formatDate(period.endDate)}
                    </span>
                    <span style={previewBadgeStyle}>Period {index + 1}</span>
                    <span style={previewMetaStyle}>Payday {formatDate(period.checkDate)}</span>
                    <span style={previewMetaStyle}>Run by {formatDate(period.runPayrollBy)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </form>
    </SDKFormProvider>
  )
}

export default function HooksPayScheduleDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} components={interfaceLibComponents}>
      <div style={pageStyle}>
        <PayScheduleForm />
      </div>
    </GustoProvider>
  )
}
