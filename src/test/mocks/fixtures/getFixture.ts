export const getFixture = async (path: string) => {
  const module = await import(`./data/${path}.json`)
  return module.default
}
