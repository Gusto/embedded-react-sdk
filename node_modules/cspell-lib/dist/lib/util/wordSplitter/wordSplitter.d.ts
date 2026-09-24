import type { TextOffset } from '@cspell/cspell-types';
import type { WordBreakOptions } from './generateWordBreaks.js';
export type IsValidWordFn = (word: TextOffset) => boolean;
export interface SplitResult {
    /** Original line passed to the split function */
    line: TextOffset;
    /** Starting point of processing - Original offset passed to the split function */
    offset: number;
    /** The span of text that was split */
    text: TextOffset;
    /** The collection of words that `text` was split into */
    words: TextOffsetWithValid[];
    /** the offset at which the split stopped */
    endOffset: number;
}
export interface TextOffsetWithOptionalValid extends TextOffset {
    length: number;
    isFound?: boolean;
}
export interface TextOffsetWithValid extends TextOffsetWithOptionalValid {
    isFound: boolean;
}
export interface SplitOptions extends WordBreakOptions {
}
/**
 *
 * @param line - the line of text
 * @param offset - absolute offset, comparable to line.offset.
 * @param isValidWord - predicate function to test if a word is valid.
 * @param options - SplitOptions
 * @returns SplitResult
 */
export declare function split(line: TextOffset, offset: number, isValidWord: IsValidWordFn, options?: SplitOptions): SplitResult;
declare function findNextWordText({ text, offset }: TextOffset): TextOffset;
export declare const __testing__: {
    findNextWordText: typeof findNextWordText;
};
export {};
//# sourceMappingURL=wordSplitter.d.ts.map