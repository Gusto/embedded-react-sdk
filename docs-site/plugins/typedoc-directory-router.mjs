import { MemberRouter } from 'typedoc-plugin-markdown'

/**
 * TypeDoc plugin: custom router for @gusto/embedded-react-sdk
 *
 * Register via  "router": "sdk-router"  in the TypeDoc config.
 */
export function load(app) {
  app.renderer.defineRouter('sdk-router', SDKRouter)
}

class SDKRouter extends MemberRouter {
  getIdealBaseName(reflection) {
    return super.getIdealBaseName(reflection)
  }
}
