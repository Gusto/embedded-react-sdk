export function load(app) {
  app.renderer.markdownHooks.on('page.begin', args => {
    const name = args.page.model.name
    const title = name.includes('/') ? name.split('/').pop() : name
    return `# ${title}`
  }),
    app.renderer.markdownHooks.on('index.page.begin', args => {
      return `# Component Adapter Inventory

The following are a list of types for available component adapters. Follow the links below to view the interfaces.`
    })
}
