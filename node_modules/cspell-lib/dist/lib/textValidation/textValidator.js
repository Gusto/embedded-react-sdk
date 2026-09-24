import { opConcatMap, opFilter, opTake, pipe } from '@cspell/cspell-pipe/sync';
import * as TextRange from '../Transform/index.js';
import * as Text from '../util/text.js';
import { defaultMaxDuplicateProblems, defaultMaxNumberOfProblems } from './defaultConstants.js';
import { lineValidatorFactory } from './lineValidatorFactory.js';
/**
 * @deprecated
 * @deprecation Use spellCheckDocument
 */
export function validateText(text, dict, options) {
    const { maxNumberOfProblems = defaultMaxNumberOfProblems, maxDuplicateProblems = defaultMaxDuplicateProblems } = options;
    const mapOfProblems = new Map();
    const includeRanges = calcTextInclusionRanges(text, options);
    const lineValidator = lineValidatorFactory(dict, options);
    const validator = lineValidator.fn;
    const iter = pipe(Text.extractLinesOfText(text), opConcatMap(mapLineToLineSegments(includeRanges)), opConcatMap(validator), opFilter((wo) => {
        const word = wo.text;
        // Keep track of the number of times we have seen the same problem
        const n = (mapOfProblems.get(word) || 0) + 1;
        mapOfProblems.set(word, n);
        // Filter out if there is too many
        return n <= maxDuplicateProblems;
    }), opTake(maxNumberOfProblems));
    return iter;
}
export function calcTextInclusionRanges(text, options, transformer) {
    const { ignoreRegExpList = [], includeRegExpList = [] } = options;
    const filteredIncludeList = includeRegExpList.filter((a) => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : [/.*/gim];
    const excludeRanges = TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text).filter((range) => !isFullySubstitutedRange(text, range, transformer));
    const includeRanges = TextRange.excludeRanges(TextRange.findMatchingRangesForPatterns(finalIncludeList, text), excludeRanges);
    return includeRanges;
}
function isFullySubstitutedRange(text, range, transformer) {
    if (!transformer)
        return false;
    const source = text.slice(range.startPos, range.endPos);
    const transformed = transformer.transform(source);
    // One source-map segment means a single substitution consumed the entire ignored range.
    return transformed.text !== source && transformed.map?.length === 2 && transformed.map[0] === source.length;
}
function mapLineToLineSegments(includeRanges) {
    const mapAgainstRanges = mapLineSegmentAgainstRangesFactory(includeRanges);
    return (line) => {
        const segment = { line, segment: line };
        return mapAgainstRanges(segment);
    };
}
/**
 * Returns a mapper function that will segment a TextOffset based upon the includeRanges.
 * This function is optimized for forward scanning. It will perform poorly for randomly ordered offsets.
 * @param includeRanges Allowed ranges for words.
 */
export function mapLineSegmentAgainstRangesFactory(includeRanges) {
    let rangePos = 0;
    const mapper = (lineSeg) => {
        if (!includeRanges.length) {
            return [];
        }
        const parts = [];
        const { segment, line } = lineSeg;
        const { text, offset, length } = segment;
        const textEndPos = offset + (length ?? text.length);
        let textStartPos = offset;
        while (rangePos && (rangePos >= includeRanges.length || includeRanges[rangePos].startPos > textStartPos)) {
            rangePos -= 1;
        }
        const cur = includeRanges[rangePos];
        if (textEndPos <= cur.endPos && textStartPos >= cur.startPos) {
            return [lineSeg];
        }
        while (textStartPos < textEndPos) {
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= textStartPos) {
                rangePos += 1;
            }
            if (!includeRanges[rangePos]) {
                break;
            }
            const { startPos, endPos } = includeRanges[rangePos];
            if (textEndPos < startPos) {
                break;
            }
            const a = Math.max(textStartPos, startPos);
            const b = Math.min(textEndPos, endPos);
            if (a !== b) {
                parts.push({ line, segment: { offset: a, text: text.slice(a - offset, b - offset) } });
            }
            textStartPos = b;
        }
        return parts;
    };
    return mapper;
}
export const _testMethods = {
    mapWordsAgainstRanges: mapLineSegmentAgainstRangesFactory,
};
//# sourceMappingURL=textValidator.js.map