import { Button } from './Button'

export const ButtonHappyPath = () => {
  return (
    <Button
      onPress={() => {
        // eslint-disable-next-line no-console
        console.log('Clicked')
      }}
    >
      Click me
    </Button>
  )
}
