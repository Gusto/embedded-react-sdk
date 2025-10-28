import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/DescriptionList',
}

export const Basic = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      items={[
        {
          term: <Components.Text>First Term</Components.Text>,
          description: <Components.Text>First description with some content</Components.Text>,
        },
        {
          term: <Components.Text>Second Term</Components.Text>,
          description: <Components.Text>Second description with more content</Components.Text>,
        },
        {
          term: <Components.Text>Third Term</Components.Text>,
          description: <Components.Text>Third description with even more content</Components.Text>,
        },
      ]}
    />
  )
}

export const BankAccountExample = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      items={[
        {
          term: <Components.Text>Routing Number</Components.Text>,
          description: <Components.Text>123456789</Components.Text>,
        },
        {
          term: <Components.Text>Account Number</Components.Text>,
          description: <Components.Text>****1234</Components.Text>,
        },
      ]}
    />
  )
}

export const MultipleTermsOneDescription = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      items={[
        {
          term: [
            <Components.Text key="1">Firefox</Components.Text>,
            <Components.Text key="2">Mozilla Firefox</Components.Text>,
            <Components.Text key="3">Fx</Components.Text>,
          ],
          description: (
            <Components.Text>
              A free, open-source, cross-platform web browser developed by the Mozilla Corporation
              and volunteers.
            </Components.Text>
          ),
        },
        {
          term: [
            <Components.Text key="1">Chrome</Components.Text>,
            <Components.Text key="2">Google Chrome</Components.Text>,
          ],
          description: (
            <Components.Text>
              A cross-platform web browser developed by Google, based on the Chromium open-source
              project.
            </Components.Text>
          ),
        },
      ]}
    />
  )
}

export const OneTermMultipleDescriptions = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      items={[
        {
          term: <Components.Text>Firefox</Components.Text>,
          description: [
            <Components.Text key="1">
              A free, open-source, cross-platform web browser developed by the Mozilla Corporation
              and volunteers.
            </Components.Text>,
            <Components.Text key="2">
              The Red Panda, also known as the Lesser Panda, is a mostly herbivorous mammal,
              slightly larger than a domestic cat.
            </Components.Text>,
          ],
        },
      ]}
    />
  )
}

export const MixedPatterns = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      items={[
        {
          term: <Components.Text>Single term, single description</Components.Text>,
          description: <Components.Text>A simple key-value pair</Components.Text>,
        },
        {
          term: [
            <Components.Text key="1">Multiple</Components.Text>,
            <Components.Text key="2">Terms</Components.Text>,
          ],
          description: <Components.Text>One description for multiple terms</Components.Text>,
        },
        {
          term: <Components.Text>One term</Components.Text>,
          description: [
            <Components.Text key="1">First description</Components.Text>,
            <Components.Text key="2">Second description</Components.Text>,
          ],
        },
      ]}
    />
  )
}

export const WithCustomClassName = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      className="custom-class"
      items={[
        {
          term: <Components.Text>Custom Styled Term</Components.Text>,
          description: <Components.Text>Custom styled description</Components.Text>,
        },
      ]}
    />
  )
}

export const SingleItem = () => {
  const Components = useComponentContext()
  return (
    <Components.DescriptionList
      items={[
        {
          term: <Components.Text>Single Term</Components.Text>,
          description: <Components.Text>Single description</Components.Text>,
        },
      ]}
    />
  )
}
