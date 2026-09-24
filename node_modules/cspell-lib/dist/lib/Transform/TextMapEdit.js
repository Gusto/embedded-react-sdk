import { mapOffsetPairsToSourceMap, mergeSourceMaps } from './SourceMap.js';
import { toMappedText } from './Transformer.js';
export function applyEditsToMappedText(text, edits) {
    const transformed = applyEditsToText(text.text, edits);
    const rawText = text.rawText ?? text.text;
    const result = {
        ...text,
        text: transformed.text,
        map: mergeSourceMaps(text.map, transformed.map),
        rawText,
    };
    return result;
}
export function applyEditsToText(text, edits) {
    const map = [0, 0];
    let repText = '';
    let lastEnd = 0;
    for (const edit of edits) {
        if (edit.range[0] > lastEnd) {
            repText += text.slice(lastEnd, edit.range[0]);
            map.push(edit.range[0], repText.length);
        }
        repText += edit.text;
        map.push(edit.range[1], repText.length);
        lastEnd = edit.range[1];
    }
    if (lastEnd === 0) {
        return toMappedText(text);
    }
    if (lastEnd < text.length) {
        repText += text.slice(lastEnd);
        map.push(text.length, repText.length);
    }
    const result = {
        text: repText,
        range: [0, text.length],
        map: mapOffsetPairsToSourceMap(map),
        rawText: text,
    };
    return result;
}
//# sourceMappingURL=TextMapEdit.js.map