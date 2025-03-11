import { screen, within } from '@testing-library/react'
import { type UserEvent } from '@testing-library/user-event'

type FillDateArgs = {
  date: {
    month: number
    day: number
    year: number
  }
  name: string
  user: UserEvent
}
export const fillDate = async ({ date: { month, day, year }, name, user }: FillDateArgs) => {
  const dateInput = await screen.findByRole('group', { name })
  await user.type(within(dateInput).getByRole('spinbutton', { name: /month/i }), String(month))
  await user.type(within(dateInput).getByRole('spinbutton', { name: /day/i }), String(day))
  await user.type(within(dateInput).getByRole('spinbutton', { name: /year/i }), String(year))
}

type FillSelectArgs = {
  optionNames: (RegExp | string)[]
  selectName: RegExp | string
  user: UserEvent
}
export const fillSelect = async ({ optionNames, selectName, user }: FillSelectArgs) => {
  await user.click(await screen.findByRole('button', { name: selectName }))
  optionNames.forEach(async optionName => {
    await user.click(await screen.findByRole('option', { name: optionName }))
  })
}
