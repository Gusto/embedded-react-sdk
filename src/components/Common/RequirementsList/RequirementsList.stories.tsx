import type { Story } from '@ladle/react'
import { RequirementsList } from './RequirementsList'

export default {
  title: 'Common/RequirementsList',
}

const mockRequirements = [
  {
    title: 'Deliver Package to Luna Park',
    description:
      'Complete your first delivery mission to the amusement park on the Moon, navigating lunar hazards and meeting the eccentric robot inhabitants who call Luna Park home.',
    completed: true,
  },
  {
    title: 'Visit the Head Museum',
    description:
      'Meet the preserved heads of famous historical figures in New New York, and learn about their quirky lives in the 31st century as you tour the museum with the crew.',
    completed: true,
  },
  {
    title: 'Join the Planet Express Crew',
    description: 'Become an official member of the intergalactic delivery team.',
    completed: false,
  },
  {
    title: 'Escape from Robot Hell',
    description: 'Survive a musical encounter with the Robot Devil beneath New Jersey.',
    completed: false,
  },
  {
    title: 'Win the Slurm Factory Tour',
    description: 'Find a golden bottle cap and tour the secretive Slurm factory.',
    completed: false,
  },
  {
    title: 'Battle the Omicronians',
    description: 'Defend Earth from the invading Omicronian aliens.',
    completed: false,
  },
  {
    title: 'Attend the Miss Universe Pageant',
    description: 'Cheer for contestants from across the galaxy at the annual event.',
    completed: false,
  },
  {
    title: 'Rescue Bender from the Mafia',
    description: 'Save Bender from his entanglement with the Robot Mafia.',
    completed: false,
  },
  {
    title: 'Explore the Lost City of Atlanta',
    description: 'Dive underwater to discover the secrets of Atlantas sunken remains.',
    completed: false,
  },
]

export const DefaultRequirementsList: Story = () => {
  return <RequirementsList requirements={mockRequirements} />
}
