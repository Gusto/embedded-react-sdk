import { FlatConfig } from 'typescript-eslint'
import requireComment from './tsdoc-require-comment'
import requireReleaseTag from './tsdoc-require-release-tag'
import sortTags from './tsdoc-sort-tags'

/**
 * Enforce rules related to TSDoc to ensure documentation coverage.
 * Inspired by `eslint-plugin-jsdoc` (excellent rules, but TSDoc is an override)
 */
export const tsdocCoverage: FlatConfig.Plugin = {
  meta: {
    name: 'tsdoc-coverage',
  },

  rules: {
    'require-release-tag': requireReleaseTag,
    'require-comment': requireComment,
    'sort-tags': sortTags,
  },
}
