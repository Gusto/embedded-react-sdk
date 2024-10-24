import {
  Button,
  Form,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectValue,
  TextField,
} from 'react-aria-components'
// import { useTranslation } from 'react-i18next';
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useGetCompanyLocations, useGetStateTaxRequirements } from '@/api/queries/company'

interface CompanyStateTaxesProps {
  companyId: string
}

// undefined means this will fallback to the user's locale
const toPercent = (value: unknown) =>
  Intl.NumberFormat(undefined, { style: 'percent' }).format(Number(value))

type RequirementSets = ReturnType<typeof useGetStateTaxRequirements>['data']['requirement_sets']
type Metadata = NonNullable<NonNullable<RequirementSets>[0]['requirements']>[0]['metadata']
type Requirement = NonNullable<NonNullable<RequirementSets>[0]['requirements']>[0]

function getPlaceholder(metadata: Metadata) {
  if (!metadata) return undefined
  if (metadata.mask) return metadata.mask
  if (metadata.validation?.type === 'min_max' && metadata.validation.min && metadata.validation.max)
    return `between ${toPercent(metadata.validation.min)} and ${toPercent(metadata.validation.max)}`
  return undefined
}

function RequirementInput({ requirement }: { requirement: Requirement }) {
  if (requirement.metadata?.type == 'account_number') {
    return <AccountNumberInput requirement={requirement} />
  }
  if (
    requirement.metadata?.type == 'tax_rate' &&
    requirement.metadata.validation?.type === 'min_max'
  ) {
    return <TaxRateInput requirement={requirement} />
  }
  if (
    requirement.metadata?.type == 'tax_rate' &&
    requirement.metadata.validation?.type === 'one_of'
  ) {
    return <TaxRateSelect requirement={requirement} />
  }

  if (requirement.metadata?.type == 'radio') {
    return <RadioInput requirement={requirement} />
  }

  if (requirement.metadata?.type == 'text') {
    return <TextInput requirement={requirement} />
  }

  if (requirement.metadata?.type == 'select') {
    return <SelectInput requirement={requirement} />
  }

  console.error(`Unsupported requirement type: ${String(requirement.metadata?.type)}`)
  return null
}

function SelectInput({ requirement }: { requirement: Requirement }) {
  if (!requirement.metadata?.options) throw new Error('Select input must have options')
  return (
    <Select name={requirement.key} style={{ marginBottom: '1rem' }}>
      <Label style={labelStyle}>{requirement.label}</Label>
      {requirement.description && (
        <p dangerouslySetInnerHTML={{ __html: requirement.description }} />
      )}
      <Button>
        <SelectValue />
        <span aria-hidden="true">▼</span>
      </Button>
      <Popover>
        <ListBox>
          {requirement.metadata.options.map(({ label, value }) => (
            <ListBoxItem key={value}>{label}</ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  )
}

function RadioInput({ requirement }: { requirement: Requirement }) {
  if (!requirement.metadata?.options) throw new Error('Radio input must have options')
  return (
    <RadioGroup
      name={requirement.key}
      style={{ marginBottom: '1rem' }}
      defaultValue={requirement.value}
    >
      <Label style={labelStyle}>{requirement.label}</Label>
      {requirement.description && (
        <p dangerouslySetInnerHTML={{ __html: requirement.description }} />
      )}
      <>
        {requirement.metadata.options.map(({ label, short_label, value }) => (
          <Radio key={short_label} value={value}>
            {label}
          </Radio>
        ))}
      </>
    </RadioGroup>
  )
}

function TextInput({ requirement }: { requirement: Requirement }) {
  return (
    <TextField
      name={requirement.key}
      style={{ marginBottom: '1rem' }}
      defaultValue={requirement.value}
    >
      <Label style={labelStyle}>{requirement.label}</Label>
      {requirement.description && (
        <p dangerouslySetInnerHTML={{ __html: requirement.description }} />
      )}
      <Input placeholder={getPlaceholder(requirement.metadata)} />
    </TextField>
  )
}

function AccountNumberInput({ requirement }: { requirement: Requirement }) {
  return (
    <TextField name={requirement.key} style={{ marginBottom: '1rem' }}>
      <Label style={labelStyle}>{requirement.label}</Label>
      {requirement.description && (
        <p dangerouslySetInnerHTML={{ __html: requirement.description }} />
      )}
      <Input placeholder={getPlaceholder(requirement.metadata)} />
    </TextField>
  )
}

function TaxRateInput({ requirement }: { requirement: Requirement }) {
  const minDecimalPlaces = String(requirement.metadata?.validation?.min).split('.')[1] || ''
  const maxDecimalPlaces = String(requirement.metadata?.validation?.max).split('.')[1] || ''
  const decimalPlaces = Math.max(minDecimalPlaces.length, maxDecimalPlaces.length)
  // This aritmetic gymnastics is to get around floating point rounding errors
  const step = 1 / Math.pow(10, decimalPlaces)
  return (
    <NumberField
      minValue={Number(requirement.metadata?.validation?.min)}
      maxValue={Number(requirement.metadata?.validation?.max)}
      step={step}
      formatOptions={{ style: 'percent', minimumSignificantDigits: 2 }}
      name={requirement.key}
      style={{ marginBottom: '1rem' }}
    >
      <Label style={labelStyle}>{requirement.label}</Label>
      {requirement.description && (
        <p dangerouslySetInnerHTML={{ __html: requirement.description }} />
      )}
      <Group style={{ width: '100%' }}>
        <Button slot="decrement">-</Button>
        <Input placeholder={getPlaceholder(requirement.metadata)} />
        <Button slot="increment">+</Button>
      </Group>
    </NumberField>
  )
}

function TaxRateSelect({ requirement }: { requirement: Requirement }) {
  return (
    <Select name={requirement.key}>
      <Label style={labelStyle}>{requirement.label}</Label>
      <Button>
        <SelectValue />
        <span aria-hidden="true">▼</span>
      </Button>
      <Popover>
        <ListBox>
          {requirement.metadata?.validation?.rates &&
            requirement.metadata.validation.rates.map(rate => (
              <ListBoxItem key={rate}>{toPercent(rate)}</ListBoxItem>
            ))}
        </ListBox>
      </Popover>
    </Select>
  )
}

const labelStyle = { fontSize: '1.4rem' }

// export const CompanyStateTaxes = BaseComponent(_CompanyStateTaxes, 'Company.StateTaxes');

export function CompanyStateTaxes(props: CompanyStateTaxesProps & BaseComponentInterface) {
  const { companyId } = props
  // const { t } = useTranslation('Company.StateTaxes');
  const { data: locations } = useGetCompanyLocations(companyId)
  const state = locations[0].state
  if (!state) throw new Error('No state found')

  const { data: companyStateTaxes } = useGetStateTaxRequirements(companyId, state)
  const requirementSets = companyStateTaxes.requirement_sets || []

  return (
    <BaseComponent {...props}>
      {/* <h1>{t('pageTitle', { state: companyStateTaxes.state })}</h1> */}
      <div style={{ borderBottom: '2px solid #cacaca', marginBottom: '2rem', width: '100%' }} />
      <Form>
        {requirementSets.map(requirementSet => {
          return (
            <div key={requirementSet.key}>
              <h2>{requirementSet.label}</h2>
              <div
                style={{ borderBottom: '2px solid #cacaca', marginBottom: '1rem', width: '100%' }}
              />
              {requirementSet.requirements?.map(requirement => {
                return (
                  <div key={requirement.key}>
                    <RequirementInput requirement={requirement} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </Form>
    </BaseComponent>
  )
}
