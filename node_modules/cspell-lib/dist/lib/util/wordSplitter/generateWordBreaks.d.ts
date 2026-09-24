import type { TextOffset } from '@cspell/cspell-types';
export declare const softHyphen = "\u00AD";
export interface LineSegment {
    line: TextOffset;
    /**
     * The starting offset within line.text.
     * The absolute offset can be obtained by adding line.offset.
     */
    relStart: number;
    /**
     * The ending offset within line.text.
     * The absolute offset can be obtained by adding line.offset.
     */
    relEnd: number;
}
export type BreakPairs = readonly [number, number];
export interface PossibleWordBreak {
    /** offset from the start of the string */
    offset: number;
    /**
     * break pairs (start, end)
     * (the characters between the start and end are removed)
     * With a pure break, start === end.
     */
    breaks: BreakPairs[];
}
export type SortedBreaks = PossibleWordBreak[];
export interface WordBreakOptions {
    optionalWordBreakCharacters?: string;
}
export declare function generateWordBreaks(line: LineSegment, options: WordBreakOptions): SortedBreaks;
//# sourceMappingURL=generateWordBreaks.d.ts.map