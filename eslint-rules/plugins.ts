import { FlatConfig } from 'typescript-eslint'
import requireComment from './tsdoc-require-comment'
import requireFormDataInterface from './tsdoc-require-form-data-interface'
import requireHookReadyInterface from './tsdoc-require-hook-ready-interface'
import requireMemberComment from './tsdoc-require-member-comment'
import requireReleaseTag from './tsdoc-require-release-tag'
import sortTags from './tsdoc-sort-tags'
import validGroup from './tsdoc-valid-group'

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
    'require-member-comment': requireMemberComment,
    'require-form-data-interface': requireFormDataInterface,
    'require-hook-ready-interface': requireHookReadyInterface,
    'sort-tags': sortTags,
    'valid-group': validGroup,
  },
}
