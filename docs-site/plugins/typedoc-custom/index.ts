import { Converter, RendererEvent } from 'typedoc'
import { type MarkdownApplication, MarkdownPageEvent } from 'typedoc-plugin-markdown'
import { SDKRouter } from './router.ts'
import { SDKTheme } from './theme.ts'

export function load(app: MarkdownApplication): void {
  app.renderer.defineRouter('sdk-router', SDKRouter)
  app.renderer.defineTheme('sdk-theme', SDKTheme)

  app.renderer.on(MarkdownPageEvent.BEGIN, SDKTheme.injectFrontmatter)
  app.renderer.on(MarkdownPageEvent.END, SDKTheme.serializeFrontmatter)
  app.renderer.on(RendererEvent.END, SDKRouter.emitCategoryFiles)

  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, SDKTheme.protectPropsInterfaces, 100)
  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, SDKRouter.reparentDeprecated, 50)
  app.converter.on(Converter.EVENT_RESOLVE_END, SDKRouter.relocateI18nTypes, 5)
  app.converter.on(Converter.EVENT_RESOLVE_END, SDKRouter.groupTranslationInterfaces, 4)
  app.converter.on(Converter.EVENT_RESOLVE_END, SDKRouter.stampGroupTags, 0)
  app.converter.on(Converter.EVENT_RESOLVE_END, SDKTheme.expandConstDerivedAliases, -100)
  app.converter.on(Converter.EVENT_RESOLVE_END, SDKTheme.dropRedundantConstDefaults, -100)
  app.converter.on(Converter.EVENT_RESOLVE_END, SDKTheme.removePropsFromGroups, -200)
}
