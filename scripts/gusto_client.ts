import { GustoClient } from 'gusto'

const gusto = new GustoClient({ token: 'WK81_GdqIm4JcNdeKDKtv_uOZevBrGxlKtW4S7oO31U'})

async function run() {
  const result = await gusto.token.getInfo()

  // Handle the result
  console.log(result)
}

run()
