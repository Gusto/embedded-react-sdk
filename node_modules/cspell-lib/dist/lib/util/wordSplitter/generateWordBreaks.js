import { escapeRegEx } from '../regexHelper.js';
import { regExDanglingQuote, regExEscapeCharacters, regExPossibleWordBreaks, regExSplitWords, regExSplitWords2, regExTrailingEndings, } from '../textRegex.js';
export const softHyphen = '\u00AD';
const ignoreBreak = Object.freeze([]);
export function generateWordBreaks(line, options) {
    const camelBreaks = genWordBreakCamel(line);
    const symbolBreaks = genSymbolBreaks(line);
    const optionalBreaks = genOptionalWordBreaks(line, options.optionalWordBreakCharacters);
    return mergeSortedBreaks(...camelBreaks, ...symbolBreaks, ...optionalBreaks);
}
function offsetRegEx(reg, offset) {
    const r = new RegExp(reg);
    r.lastIndex = offset;
    return r;
}
function genWordBreakCamel(line) {
    const breaksCamel1 = [];
    const text = line.line.text.slice(0, line.relEnd);
    // lower,Upper: camelCase -> camel|Case
    for (const m of text.matchAll(offsetRegEx(regExSplitWords, line.relStart))) {
        if (m.index === undefined)
            break;
        const i = m.index + m[1].length;
        breaksCamel1.push({
            offset: m.index,
            breaks: [[i, i], ignoreBreak],
        });
    }
    const breaksCamel2 = [];
    // cspell:ignore ERRORC
    // Upper,Upper,lower: ERRORCodes -> ERROR|Codes, ERRORC|odes
    for (const m of text.matchAll(offsetRegEx(regExSplitWords2, line.relStart))) {
        if (m.index === undefined)
            break;
        const i = m.index + m[1].length;
        const j = i + m[3].length;
        breaksCamel2.push({
            offset: m.index,
            breaks: [[i, i], [j, j], ignoreBreak],
        });
    }
    return [breaksCamel1, breaksCamel2];
}
function calcBreaksForSubString(line, subStr, calcBreak) {
    const sb = [];
    const text = line.line.text;
    const inc = subStr.length;
    for (let pos = text.indexOf(subStr, line.relStart); pos >= 0 && pos < line.relEnd; pos = text.indexOf(subStr, pos + inc)) {
        const b = calcBreak(pos, pos + inc);
        if (b) {
            sb.push(b);
        }
    }
    return sb;
}
function calcBreaksForRegEx(line, reg, calcBreak) {
    const sb = [];
    const text = line.line.text.slice(0, line.relEnd);
    for (const m of text.matchAll(offsetRegEx(reg, line.relStart))) {
        const b = calcBreak(m);
        if (b) {
            sb.push(b);
        }
    }
    return sb;
}
function calcOptionalWordBreak(i, j) {
    return {
        offset: i,
        breaks: [
            [i, j], // Remove the characters
            ignoreBreak,
        ],
    };
}
function genOptionalWordBreaks(line, optionalBreakCharacters) {
    function calcBreaks(m) {
        const i = m.index;
        if (i === undefined)
            return;
        const j = i + m[0].length;
        return calcOptionalWordBreak(i, j);
    }
    const breaks = [
        calcBreaksForSubString(line, softHyphen, calcOptionalWordBreak),
        calcBreaksForRegEx(line, regExDanglingQuote, calcBreaks),
        calcBreaksForRegEx(line, regExTrailingEndings, calcBreaks),
    ];
    if (optionalBreakCharacters) {
        const regex = new RegExp(`[${escapeRegEx(optionalBreakCharacters)}]`, 'gu');
        breaks.push(calcBreaksForRegEx(line, regex, calcBreaks));
    }
    return breaks;
}
function genSymbolBreaks(line) {
    function calcBreaks(m) {
        const i = m.index;
        if (i === undefined)
            return;
        const j = i + m[0].length;
        return {
            offset: i,
            breaks: [
                [i, j], // Remove the characters
                [i, i], // keep characters with word to right
                [j, j], // keep characters with word to left
                ignoreBreak,
            ],
        };
    }
    return [
        calcBreaksForRegEx(line, regExPossibleWordBreaks, calcBreaks),
        calcBreaksForRegEx(line, /\d+/g, calcBreaks),
        calcBreaksForRegEx(line, regExEscapeCharacters, calcBreaks),
    ];
}
function mergeSortedBreaks(...maps) {
    return maps.flat().sort((a, b) => a.offset - b.offset);
}
//# sourceMappingURL=generateWordBreaks.js.map