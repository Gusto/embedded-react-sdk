export const getFixture = async (path: string) => {
  const module = await import(`./${path}.json`)
  return module.default
}
