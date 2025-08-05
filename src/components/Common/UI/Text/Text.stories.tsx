import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Typography/Text',
}

// Shared styles for displaying the text stories
const createStyles = () => {
  return {
    gridContainerStyle: {
      display: 'grid',
      gridGap: '2rem',
      maxWidth: '1200px',
    },
    sectionStyle: {
      marginBottom: '2rem',
    },
    sectionTitleStyle: {
      fontWeight: 'bold',
      fontSize: '1.2rem',
      borderBottom: '1px solid #ccc',
      paddingBottom: '0.5rem',
      marginBottom: '1rem',
    },
    tableStyle: {
      borderCollapse: 'collapse' as const,
      width: '100%',
      border: '1px solid #eee',
    },
    cellStyle: {
      padding: '0.75rem',
      border: '1px solid #eee',
      verticalAlign: 'top' as const,
    },
    headerCellStyle: {
      padding: '0.75rem',
      border: '1px solid #eee',
      verticalAlign: 'top' as const,
      fontWeight: 'bold',
      backgroundColor: '#f7f7f7',
      textAlign: 'center' as const,
    },
    cardStyle: {
      padding: '1rem',
      border: '1px solid #eee',
      borderRadius: '4px',
      marginBottom: '1rem',
    },
    labelStyle: {
      fontSize: '0.75rem',
      color: '#666',
      marginBottom: '0.25rem',
    },
  }
}

export const AllOptions: Story = () => {
  const Components = useComponentContext()

  const sizes = ['sm', 'md', 'lg'] as const
  const weights = ['regular', 'medium', 'semibold', 'bold'] as const
  const elements = ['p', 'div', 'span'] as const

  const styles = createStyles()

  return (
    <div style={styles.gridContainerStyle}>
      {/* Size × Weight Matrix (with p element) */}
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Size × Weight Matrix (as=p)</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>↓ size \ weight →</th>
              {weights.map(weight => (
                <th key={weight} style={styles.headerCellStyle}>
                  {weight}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <th style={styles.headerCellStyle}>{size}</th>
                {weights.map(weight => (
                  <td key={`${size}-${weight}`} style={styles.cellStyle}>
                    <Components.Text size={size} weight={weight}>
                      {size} {weight}
                    </Components.Text>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Element Types with Different Sizes */}
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Element Types with Different Sizes</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>↓ as \ size →</th>
              {sizes.map(size => (
                <th key={size} style={styles.headerCellStyle}>
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map(element => (
              <tr key={element}>
                <th style={styles.headerCellStyle}>{element}</th>
                {sizes.map(size => (
                  <td key={`${element}-${size}`} style={styles.cellStyle}>
                    {element === 'span' ? (
                      <div>
                        Text{' '}
                        <Components.Text as={element} size={size}>
                          {element} {size}
                        </Components.Text>{' '}
                        after
                      </div>
                    ) : (
                      <Components.Text as={element} size={size}>
                        {element} {size}
                      </Components.Text>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Element Types with Different Weights */}
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Element Types with Different Weights</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>↓ as \ weight →</th>
              {weights.map(weight => (
                <th key={weight} style={styles.headerCellStyle}>
                  {weight}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map(element => (
              <tr key={element}>
                <th style={styles.headerCellStyle}>{element}</th>
                {weights.map(weight => (
                  <td key={`${element}-${weight}`} style={styles.cellStyle}>
                    {element === 'span' ? (
                      <div>
                        Text{' '}
                        <Components.Text as={element} weight={weight}>
                          {element} {weight}
                        </Components.Text>{' '}
                        after
                      </div>
                    ) : (
                      <Components.Text as={element} weight={weight}>
                        {element} {weight}
                      </Components.Text>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Text Alignment Examples */}
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Text Alignment Options</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>start (default)</th>
              <th style={styles.headerCellStyle}>center</th>
              <th style={styles.headerCellStyle}>end</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.cellStyle}>
                <Components.Text textAlign="start">Text aligned to start</Components.Text>
              </td>
              <td style={styles.cellStyle}>
                <Components.Text textAlign="center">Text aligned to center</Components.Text>
              </td>
              <td style={styles.cellStyle}>
                <Components.Text textAlign="end">Text aligned to end</Components.Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const SizeProp: Story = () => {
  const Components = useComponentContext()
  const sizes = ['sm', 'md', 'lg'] as const
  const styles = createStyles()

  return (
    <div style={styles.gridContainerStyle}>
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Text Sizes</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>Size</th>
              <th style={styles.headerCellStyle}>Example</th>
              <th style={styles.headerCellStyle}>Description</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <th style={styles.headerCellStyle}>{size}</th>
                <td style={styles.cellStyle}>
                  <Components.Text size={size}>
                    This is text with size=&quot;{size}&quot;
                  </Components.Text>
                </td>
                <td style={styles.cellStyle}>
                  {size === 'sm' && 'Small text, good for secondary information or captions.'}
                  {size === 'md' && 'Medium text (default), standard size for main content.'}
                  {size === 'lg' &&
                    'Large text, suitable for important information or subheadings.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Size Comparison</div>
        <div style={styles.cardStyle}>
          {sizes.map(size => (
            <div key={size} style={{ marginBottom: '0.5rem' }}>
              <Components.Text size={size}>Text with size=&quot;{size}&quot;</Components.Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const ElementTypeProp: Story = () => {
  const Components = useComponentContext()
  const styles = createStyles()

  return (
    <div style={styles.gridContainerStyle}>
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Element Types (as prop)</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>Element</th>
              <th style={styles.headerCellStyle}>Example</th>
              <th style={styles.headerCellStyle}>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={styles.headerCellStyle}>p</th>
              <td style={styles.cellStyle}>
                <Components.Text>This is a paragraph element (as=&quot;p&quot;)</Components.Text>
              </td>
              <td style={styles.cellStyle}>
                Use for paragraphs of text. Creates a block-level element with top and bottom
                margins.
              </td>
            </tr>
            <tr>
              <th style={styles.headerCellStyle}>div</th>
              <td style={styles.cellStyle}>
                <Components.Text as="div">
                  This is a div element (as=&quot;div&quot;)
                </Components.Text>
              </td>
              <td style={styles.cellStyle}>
                Use for block-level containers without semantic meaning. Useful when you need a
                block container but not a paragraph.
              </td>
            </tr>
            <tr>
              <th style={styles.headerCellStyle}>span</th>
              <td style={styles.cellStyle}>
                Text before{' '}
                <Components.Text as="span">
                  this is a span element (as=&quot;span&quot;)
                </Components.Text>{' '}
                and text after.
              </td>
              <td style={styles.cellStyle}>
                Use for inline text that needs styling. Does not create line breaks before or after.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Element Types in Context</div>
        <div style={styles.cardStyle}>
          <Components.Text>
            This is a paragraph element. Paragraphs are block-level elements that have spacing above
            and below them. They&apos;re used for standard text content in documents.
          </Components.Text>

          <div style={{ marginTop: '1.5rem' }}>
            <Components.Text as="div">
              This is a div element. Like paragraphs, divs are also block-level elements, but they
              don&apos;t have the semantic meaning of a paragraph. They&apos;re useful as generic
              containers.
            </Components.Text>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            This is regular text with{' '}
            <Components.Text as="span" weight="bold">
              span elements
            </Components.Text>{' '}
            inserted within it. Spans are{' '}
            <Components.Text as="span" size="lg">
              inline elements
            </Components.Text>{' '}
            that don&apos;t create line breaks, making them perfect for{' '}
            <Components.Text as="span" size="sm" weight="medium">
              styling portions
            </Components.Text>{' '}
            of text.
          </div>
        </div>
      </div>
    </div>
  )
}

export const WeightProp: Story = () => {
  const Components = useComponentContext()
  const weights = ['regular', 'medium', 'semibold', 'bold'] as const
  const styles = createStyles()

  return (
    <div style={styles.gridContainerStyle}>
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Text Weights</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>Weight</th>
              <th style={styles.headerCellStyle}>Example</th>
              <th style={styles.headerCellStyle}>Usage</th>
            </tr>
          </thead>
          <tbody>
            {weights.map(weight => (
              <tr key={weight}>
                <th style={styles.headerCellStyle}>{weight}</th>
                <td style={styles.cellStyle}>
                  <Components.Text weight={weight}>
                    This text has weight=&quot;{weight}&quot;
                  </Components.Text>
                </td>
                <td style={styles.cellStyle}>
                  {weight === 'regular' &&
                    'Default weight for normal body text. Used for most content.'}
                  {weight === 'medium' &&
                    'Medium weight provides moderate emphasis without being too heavy.'}
                  {weight === 'semibold' &&
                    'Semibold weight provides stronger emphasis than medium, but less than bold.'}
                  {weight === 'bold' &&
                    'Bold weight for strong emphasis. Use for headings or to draw attention.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Weight Usage Examples</div>
        <div style={styles.cardStyle}>
          <Components.Text size="lg" weight="bold">
            Article Title
          </Components.Text>
          <Components.Text weight="semibold">
            Article Subtitle with semibold emphasis
          </Components.Text>
          <Components.Text weight="medium">Section heading with medium emphasis</Components.Text>
          <Components.Text>
            This is a paragraph with regular weight text. Most of your content should use this
            weight for optimal readability. You can use{' '}
            <Components.Text as="span" weight="medium">
              medium weight
            </Components.Text>{' '}
            for moderate emphasis,{' '}
            <Components.Text as="span" weight="semibold">
              semibold weight
            </Components.Text>{' '}
            for stronger emphasis, or{' '}
            <Components.Text as="span" weight="bold">
              bold weight
            </Components.Text>{' '}
            for the strongest emphasis within a paragraph.
          </Components.Text>
        </div>
      </div>
    </div>
  )
}

export const TextAlignProp: Story = () => {
  const Components = useComponentContext()
  const alignments = ['start', 'center', 'end'] as const
  const styles = createStyles()

  return (
    <div style={styles.gridContainerStyle}>
      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Text Alignment</div>
        <table style={styles.tableStyle}>
          <thead>
            <tr>
              <th style={styles.headerCellStyle}>Alignment</th>
              <th style={styles.headerCellStyle}>Example</th>
              <th style={styles.headerCellStyle}>Usage</th>
            </tr>
          </thead>
          <tbody>
            {alignments.map(align => (
              <tr key={align}>
                <th style={styles.headerCellStyle}>{align}</th>
                <td style={styles.cellStyle}>
                  <Components.Text textAlign={align}>
                    This text is aligned to the {align}
                  </Components.Text>
                </td>
                <td style={styles.cellStyle}>
                  {align === 'start' &&
                    'Default alignment (left in LTR languages). Use for most body text for optimal readability.'}
                  {align === 'center' &&
                    'Centered text. Use for headings, quotes, or to draw attention to a specific element.'}
                  {align === 'end' &&
                    'Right-aligned in LTR languages. Use for specific elements like dates or numbers in tables.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.sectionStyle}>
        <div style={styles.sectionTitleStyle}>Alignment in Context</div>
        <div style={styles.cardStyle}>
          <Components.Text size="lg" weight="bold" textAlign="center">
            Centered Heading
          </Components.Text>

          <div style={{ marginTop: '1rem' }}>
            <Components.Text textAlign="start">
              This paragraph uses start alignment, which is the default for body text. Start
              alignment (left-aligned in left-to-right languages) is typically used for most content
              as it&apos;s the most readable format for body text.
            </Components.Text>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Components.Text textAlign="center">
              This paragraph uses center alignment. Center alignment works well for headings,
              quotes, or when you want to draw special attention to a short piece of text.
            </Components.Text>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Components.Text textAlign="end">
              This paragraph uses end alignment. End alignment (right-aligned in left-to-right
              languages) is less common for body text but can be useful for specific elements like
              dates or numerical information in tables or forms.
            </Components.Text>
          </div>
        </div>
      </div>
    </div>
  )
}
