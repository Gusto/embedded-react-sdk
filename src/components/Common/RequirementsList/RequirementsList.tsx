import classNames from 'classnames'
import { useId } from 'react'
import { Flex } from '../Flex/Flex'
import styles from './RequirementsList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import SuccessCheck from '@/assets/icons/checkbox.svg?react'

interface RequirementsListProps {
  requirements: {
    title: string
    description: string
    completed: boolean
  }[]
}
export const RequirementsList = ({ requirements }: RequirementsListProps) => {
  const Components = useComponentContext()
  const id = useId()

  return (
    <Flex flexDirection="column" alignItems="flex-start" gap={8}>
      <ul className={styles.list}>
        {requirements
          .sort((a, b) => (a.completed ? -1 : 1))
          .map((step, i) => {
            return (
              <li key={`${id}-${i}-${step.description}`} className={styles.listItem}>
                {step.completed ? (
                  <div className={classNames(styles.listItemIcon, styles.success)}>
                    <SuccessCheck width={16} height={16} />
                  </div>
                ) : (
                  <div className={styles.listItemIcon}>{i + 1}</div>
                )}
                <Flex flexDirection="column" gap={0}>
                  <Components.Heading as="h4">{step.title}</Components.Heading>
                  <Components.Text variant="supporting">{step.description}</Components.Text>
                </Flex>
              </li>
            )
          })}
      </ul>
    </Flex>
  )
}
