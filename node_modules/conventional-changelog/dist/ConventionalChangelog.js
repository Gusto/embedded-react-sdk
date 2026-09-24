import fs from 'fs/promises';
import { Readable } from 'stream';
import { ConventionalGitClient, packagePrefix } from '@conventional-changelog/git-client';
import { transformCommit, formatDate, writeChangelog } from 'conventional-changelog-writer';
import { createPresetLoader, loadPreset as defaultLoadPreset } from 'conventional-changelog-preset-loader';
import { normalizePackageData } from '@simple-libs/normalize-package-data';
import { findPackage } from 'fd-package-json';
import { parseHostedGitUrl } from '@simple-libs/hosted-git-info';
import { getHostOptions, guessNextTag, isUnreleasedVersion, versionTagRegex, matchSemverTag, defaultCommitTransform, bindLogNamespace } from './utils.js';
export { packagePrefix };
/**
 * Conventional changelog generator
 */
export class ConventionalChangelog {
    gitClient;
    params;
    constructor(cwdOrGitClient = process.cwd()) {
        this.gitClient = typeof cwdOrGitClient === 'string'
            ? new ConventionalGitClient(cwdOrGitClient)
            : cwdOrGitClient;
        this.params = Promise.resolve({
            options: {
                append: false,
                releaseCount: 1,
                formatDate,
                transformCommit: defaultCommitTransform
            },
            commits: {
                format: '%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci',
                merges: false
            }
        });
    }
    composeParams(params) {
        this.params = Promise.all([params, this.params]).then(([params, prevParams]) => ({
            options: {
                ...prevParams.options,
                ...params.options
            },
            context: {
                ...prevParams.context,
                ...params.context
            },
            tags: {
                ...prevParams.tags,
                ...params.tags
            },
            commits: {
                ...prevParams.commits,
                ...params.commits
            },
            parser: {
                ...prevParams.parser,
                ...params.parser
            },
            writer: {
                ...prevParams.writer,
                ...params.writer
            },
            repository: {
                ...prevParams.repository,
                ...params.repository
            },
            package: prevParams.package || params.package
        }));
    }
    async finalizeContext(semverTags, hostOptions) {
        const { options, package: pkg, repository, context } = await this.params;
        const finalContext = {
            packageData: pkg,
            version: pkg?.version,
            gitSemverTags: semverTags,
            ...context
        };
        if (repository) {
            finalContext.repoUrl ||= repository.url;
            finalContext.host ||= repository.host;
            finalContext.owner ||= repository.owner;
            finalContext.repository ||= repository.project;
        }
        if (hostOptions) {
            finalContext.issue ||= hostOptions.issue;
            finalContext.commit ||= hostOptions.commit;
            finalContext.compare ||= hostOptions.compare;
        }
        if (isUnreleasedVersion(semverTags, finalContext.version) && options.outputUnreleased) {
            finalContext.version = 'Unreleased';
        }
        return finalContext;
    }
    async finalizeWriterOptions(semverTags, version) {
        const { options, tags, writer } = await this.params;
        let doFlush = options.outputUnreleased;
        if (isUnreleasedVersion(semverTags, version) && !doFlush) {
            doFlush = false;
        }
        else if (typeof doFlush !== 'boolean') {
            doFlush = true;
        }
        const finalOptions = {
            finalizeContext(context, _writerOpts, _filteredCommits, keyCommit, originalCommits) {
                const [firstCommit] = originalCommits;
                const lastCommit = originalCommits[originalCommits.length - 1];
                const firstCommitHash = firstCommit ? firstCommit.hash : null;
                const lastCommitHash = lastCommit ? lastCommit.hash : null;
                if ((!context.currentTag || !context.previousTag) && keyCommit) {
                    const { currentTag } = context;
                    context.currentTag = currentTag
                        || matchSemverTag(keyCommit.gitTags, versionTagRegex, tag => semverTags.includes(tag));
                    const index = context.currentTag
                        ? semverTags.indexOf(context.currentTag)
                        : -1;
                    // if `keyCommit.gitTags` is not a semver
                    if (index === -1) {
                        context.currentTag = currentTag || null;
                    }
                    else {
                        const previousTag = semverTags[index + 1];
                        context.previousTag = previousTag;
                        if (!previousTag) {
                            if (options.append) {
                                context.previousTag ||= firstCommitHash;
                            }
                            else {
                                context.previousTag ||= lastCommitHash;
                            }
                        }
                    }
                }
                else {
                    context.previousTag ||= semverTags[0];
                    if (context.version === 'Unreleased') {
                        if (options.append) {
                            context.currentTag ||= lastCommitHash;
                        }
                        else {
                            context.currentTag ||= firstCommitHash;
                        }
                    }
                    else if (!context.currentTag) {
                        if (tags?.prefix) {
                            context.currentTag = tags.prefix + (context.version || '');
                        }
                        else {
                            context.currentTag = guessNextTag(semverTags[0], context.version);
                        }
                    }
                }
                if (typeof context.linkCompare !== 'boolean' && context.previousTag && context.currentTag) {
                    context.linkCompare = true;
                }
                return context;
            },
            reverse: options.append,
            doFlush,
            ...writer
        };
        if (!finalOptions.debug && options.debug) {
            finalOptions.debug = bindLogNamespace('writer', options.debug);
        }
        return finalOptions;
    }
    async getSemverTags() {
        const { gitClient } = this;
        const { tags: params } = await this.params;
        const tags = [];
        for await (const tag of gitClient.getSemverTags(params)) {
            tags.push(tag);
        }
        return tags;
    }
    async *getCommits(semverTags, hostOptions) {
        const { gitClient } = this;
        const { options, commits, parser } = await this.params;
        const { reset, releaseCount } = options;
        const isManualRange = Boolean(commits.to && (commits.from || commits.to !== 'HEAD'));
        const params = {
            from: reset || isManualRange
                ? undefined
                : releaseCount
                    ? semverTags[releaseCount - 1]
                    : undefined,
            ...commits
        };
        const parserParams = {
            ...parser
        };
        if (!parserParams.warn && options.warn) {
            parserParams.warn = bindLogNamespace('parser', options.warn);
        }
        if (options.append) {
            params.reverse = true;
        }
        if (hostOptions?.referenceActions && !parserParams.referenceActions?.length) {
            parserParams.referenceActions = hostOptions.referenceActions;
        }
        if (hostOptions?.issuePrefixes && !parserParams.issuePrefixes?.length) {
            parserParams.issuePrefixes = hostOptions.issuePrefixes;
        }
        try {
            await gitClient.verify('HEAD');
            if (isManualRange) {
                yield* gitClient.getCommits(params, parserParams);
                return;
            }
            let reverseTags = semverTags.slice().reverse();
            reverseTags.push('HEAD');
            if (params.from) {
                if (reverseTags.includes(params.from)) {
                    reverseTags = reverseTags.slice(reverseTags.indexOf(params.from));
                }
                else {
                    reverseTags = [params.from, 'HEAD'];
                }
            }
            else {
                reverseTags.unshift('');
            }
            const streams = [];
            for (let i = 1, len = reverseTags.length; i < len; i++) {
                streams.push(gitClient.getCommits({
                    ...params,
                    from: reverseTags[i - 1],
                    to: reverseTags[i]
                }, parserParams));
            }
            if (!params.reverse) {
                streams.reverse();
            }
            for (const stream of streams) {
                yield* stream;
            }
        }
        catch {
            yield* gitClient.getCommits(params, parserParams);
        }
    }
    async *transformCommits(commits) {
        const params = await this.params;
        const { transformCommit: transform } = params.options;
        let transformed;
        for await (const commit of commits) {
            transformed = await transformCommit(commit, transform, params);
            if (transformed) {
                yield transformed;
            }
        }
    }
    async getPackageJson(pkgPath, transform) {
        const { gitClient } = this;
        let pkg;
        if (pkgPath) {
            pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
        }
        else {
            pkg = (await findPackage(gitClient.cwd) || {});
        }
        pkg = normalizePackageData(pkg);
        if (!pkg.repository?.url) {
            try {
                const repoUrl = await gitClient.getConfig('remote.origin.url');
                if (repoUrl) {
                    pkg.repository = {
                        ...pkg.repository,
                        url: repoUrl
                    };
                }
            }
            catch { }
        }
        if (transform) {
            pkg = transform(pkg);
        }
        const result = {
            package: pkg
        };
        const repositoryURL = (pkg.repository?.url || pkg.repository);
        if (repositoryURL) {
            result.repository = parseHostedGitUrl(repositoryURL);
        }
        return result;
    }
    /**
     * Load configs from a preset
     * @param preset
     * @param loader - Preset module loader, if not provided, will use default loader
     * @returns this
     */
    loadPreset(preset, loader) {
        const loadPreset = loader ? createPresetLoader(loader) : defaultLoadPreset;
        const config = loadPreset(preset).then((config) => {
            if (!config) {
                throw Error('Preset is not loaded or have incorrect exports');
            }
            return config;
        });
        this.composeParams(config);
        return this;
    }
    /**
     * Set the config directly
     * @param config - Config object
     * @returns this
     */
    config(config) {
        this.composeParams(config);
        return this;
    }
    readPackage(pathOrTransform, maybeTransform) {
        const [pkgPath, transform] = typeof pathOrTransform === 'string'
            ? [pathOrTransform, maybeTransform]
            : [undefined, pathOrTransform];
        this.composeParams(this.getPackageJson(pkgPath, transform));
        return this;
    }
    /**
     * Set package.json data
     * @param pkg - Package.json data
     * @returns this
     */
    package(pkg) {
        this.composeParams({
            package: pkg
        });
        return this;
    }
    /**
     * Read repository info from the current git repository
     * @returns this
     */
    readRepository() {
        this.composeParams(this.gitClient.getConfig('remote.origin.url').then(repository => ({
            repository: parseHostedGitUrl(repository)
        })));
        return this;
    }
    /**
     * Set repository info
     * @param infoOrGitUrl - Hosted git info or git url
     * @returns this
     */
    repository(infoOrGitUrl) {
        const info = typeof infoOrGitUrl === 'string'
            ? parseHostedGitUrl(infoOrGitUrl)
            : infoOrGitUrl;
        this.composeParams({
            repository: info
        });
        return this;
    }
    /**
     * Set conventional-changelog options
     * @param options - Generator options
     * @returns this
     */
    options(options) {
        this.composeParams({
            options
        });
        return this;
    }
    /**
     * Set writer context data
     * @param context - Writer context data
     * @returns this
     */
    context(context) {
        this.composeParams({
            context
        });
        return this;
    }
    /**
     * Set params to get semver tags
     * @param params - Params to get the last semver tag
     * @returns this
     */
    tags(params) {
        this.composeParams({
            tags: params
        });
        return this;
    }
    /**
     * Set params to get commits
     * @param params - Params to get commits since last release
     * @param parserOptions - Parser options
     * @returns this
     */
    commits(params, parserOptions) {
        this.composeParams({
            commits: params,
            parser: parserOptions
        });
        return this;
    }
    /**
     * Set writer options
     * @param params - Writer options
     * @returns this
     */
    writer(params) {
        this.composeParams({
            writer: params
        });
        return this;
    }
    async *write(includeDetails) {
        const { gitClient } = this;
        const { options, repository, context } = await this.params;
        const hostOptions = getHostOptions(repository, context);
        if (!gitClient.debug && options.debug) {
            gitClient.debug = bindLogNamespace('git-client', options.debug);
        }
        if (!hostOptions && options.warn) {
            options.warn('core', `Host is not supported: ${context?.host || repository?.host}`);
        }
        const semverTags = await this.getSemverTags();
        const finalContext = await this.finalizeContext(semverTags, hostOptions);
        const writerOptions = await this.finalizeWriterOptions(semverTags, finalContext.version);
        const commits = this.getCommits(semverTags, hostOptions);
        const transformedCommits = this.transformCommits(commits);
        const changelogWriter = writeChangelog(finalContext, writerOptions, includeDetails);
        yield* changelogWriter(transformedCommits);
    }
    /**
     * Generate changelog to stream
     * @param includeDetails - Generate data objects instead of strings
     * @returns Changelog stream
     */
    writeStream(includeDetails) {
        return Readable.from(this.write(includeDetails));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVudGlvbmFsQ2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbnZlbnRpb25hbENoYW5nZWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDNUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUtqQyxPQUFPLEVBR0wscUJBQXFCLEVBQ3JCLGFBQWEsRUFDZCxNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sRUFJTCxlQUFlLEVBQ2YsVUFBVSxFQUNWLGNBQWMsRUFDZixNQUFNLCtCQUErQixDQUFBO0FBQ3RDLE9BQU8sRUFJTCxrQkFBa0IsRUFDbEIsVUFBVSxJQUFJLGlCQUFpQixFQUNoQyxNQUFNLHNDQUFzQyxDQUFBO0FBQzdDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM3QyxPQUFPLEVBRUwsaUJBQWlCLEVBQ2xCLE1BQU0sOEJBQThCLENBQUE7QUFVckMsT0FBTyxFQUNMLGNBQWMsRUFDZCxZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLGVBQWUsRUFDZixjQUFjLEVBQ2Qsc0JBQXNCLEVBQ3RCLGdCQUFnQixFQUNqQixNQUFNLFlBQVksQ0FBQTtBQUVuQixPQUFPLEVBQUUsYUFBYSxFQUFFLENBQUE7QUFFeEI7O0dBRUc7QUFDSCxNQUFNLE9BQU8scUJBQXFCO0lBQ2YsU0FBUyxDQUF1QjtJQUN6QyxNQUFNLENBQWlCO0lBRS9CLFlBQVksY0FBYyxHQUFtQyxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ3hFLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxjQUFjLEtBQUssUUFBUTtZQUNqRCxDQUFDLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxjQUFjLENBQUM7WUFDM0MsQ0FBQyxDQUFDLGNBQWMsQ0FBQTtRQUVsQixJQUFJ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