var $bvSDe$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "DragAndDropContext", () => $0c2289d253cb4544$export$d188a835a7bc5783);
$parcel$export(module.exports, "DropIndicatorContext", () => $0c2289d253cb4544$export$f55761759794cf55);
$parcel$export(module.exports, "DropIndicator", () => $0c2289d253cb4544$export$62ed72bc21f6b8a6);
$parcel$export(module.exports, "useRenderDropIndicator", () => $0c2289d253cb4544$export$971707d8a129a1f7);
$parcel$export(module.exports, "useDndPersistedKeys", () => $0c2289d253cb4544$export$d1e8e3fbb7461f6);
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
const $0c2289d253cb4544$export$d188a835a7bc5783 = /*#__PURE__*/ (0, $bvSDe$react.createContext)({});
const $0c2289d253cb4544$export$f55761759794cf55 = /*#__PURE__*/ (0, $bvSDe$react.createContext)(null);
const $0c2289d253cb4544$export$62ed72bc21f6b8a6 = /*#__PURE__*/ (0, $bvSDe$react.forwardRef)(function DropIndicator(props, ref) {
    let { render: render } = (0, $bvSDe$react.useContext)($0c2289d253cb4544$export$f55761759794cf55);
    return /*#__PURE__*/ (0, ($parcel$interopDefault($bvSDe$react))).createElement((0, ($parcel$interopDefault($bvSDe$react))).Fragment, null, render(props, ref));
});
function $0c2289d253cb4544$export$971707d8a129a1f7(dragAndDropHooks, dropState) {
    var _dragAndDropHooks_isVirtualDragging;
    let renderDropIndicator = dragAndDropHooks === null || dragAndDropHooks === void 0 ? void 0 : dragAndDropHooks.renderDropIndicator;
    let isVirtualDragging = dragAndDropHooks === null || dragAndDropHooks === void 0 ? void 0 : (_dragAndDropHooks_isVirtualDragging = dragAndDropHooks.isVirtualDragging) === null || _dragAndDropHooks_isVirtualDragging === void 0 ? void 0 : _dragAndDropHooks_isVirtualDragging.call(dragAndDropHooks);
    let fn = (0, $bvSDe$react.useCallback)((target)=>{
        // Only show drop indicators when virtual dragging or this is the current drop target.
        if (isVirtualDragging || (dropState === null || dropState === void 0 ? void 0 : dropState.isDropTarget(target))) return renderDropIndicator ? renderDropIndicator(target) : /*#__PURE__*/ (0, ($parcel$interopDefault($bvSDe$react))).createElement($0c2289d253cb4544$export$62ed72bc21f6b8a6, {
            target: target
        });
    // We invalidate whenever the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dropState === null || dropState === void 0 ? void 0 : dropState.target,
        isVirtualDragging,
        renderDropIndicator
    ]);
    return (dragAndDropHooks === null || dragAndDropHooks === void 0 ? void 0 : dragAndDropHooks.useDropIndicator) ? fn : undefined;
}
function $0c2289d253cb4544$export$d1e8e3fbb7461f6(selectionManager, dragAndDropHooks, dropState) {
    var _dragAndDropHooks_isVirtualDragging, _dropState_target;
    // Persist the focused key and the drop target key.
    let focusedKey = selectionManager.focusedKey;
    let dropTargetKey = null;
    if ((dragAndDropHooks === null || dragAndDropHooks === void 0 ? void 0 : (_dragAndDropHooks_isVirtualDragging = dragAndDropHooks.isVirtualDragging) === null || _dragAndDropHooks_isVirtualDragging === void 0 ? void 0 : _dragAndDropHooks_isVirtualDragging.call(dragAndDropHooks)) && (dropState === null || dropState === void 0 ? void 0 : (_dropState_target = dropState.target) === null || _dropState_target === void 0 ? void 0 : _dropState_target.type) === 'item') {
        dropTargetKey = dropState.target.key;
        if (dropState.target.dropPosition === 'after') {
            // Normalize to the "before" drop position since we only render those to the DOM.
            let nextKey = dropState.collection.getKeyAfter(dropTargetKey);
            let lastDescendantKey = null;
            if (nextKey != null) {
                var _dropState_collection_getItem;
                var _dropState_collection_getItem_level;
                let targetLevel = (_dropState_collection_getItem_level = (_dropState_collection_getItem = dropState.collection.getItem(dropTargetKey)) === null || _dropState_collection_getItem === void 0 ? void 0 : _dropState_collection_getItem.level) !== null && _dropState_collection_getItem_level !== void 0 ? _dropState_collection_getItem_level : 0;
                // Skip over any rows that are descendants of the target ("after" position should be after all children)
                while(nextKey){
                    let node = dropState.collection.getItem(nextKey);
                    // eslint-disable-next-line max-depth
                    if (!node) break;
                    // Skip over non-item nodes (e.g., loaders) since they can't be drop targets.
                    // eslint-disable-next-line max-depth
                    if (node.type !== 'item') {
                        nextKey = dropState.collection.getKeyAfter(nextKey);
                        continue;
                    }
                    var _node_level;
                    // Stop once we find an item at the same level or higher
                    // eslint-disable-next-line max-depth
                    if (((_node_level = node.level) !== null && _node_level !== void 0 ? _node_level : 0) <= targetLevel) break;
                    lastDescendantKey = nextKey;
                    nextKey = dropState.collection.getKeyAfter(nextKey);
                }
            }
            var _ref;
            // If nextKey is null (end of collection), use the last descendant
            dropTargetKey = (_ref = nextKey !== null && nextKey !== void 0 ? nextKey : lastDescendantKey) !== null && _ref !== void 0 ? _ref : dropTargetKey;
        }
    }
    return (0, $bvSDe$react.useMemo)(()=>{
        return new Set([
            focusedKey,
            dropTargetKey
        ].filter((k)=>k != null));
    }, [
        focusedKey,
        dropTargetKey
    ]);
}


//# sourceMappingURL=DragAndDrop.main.js.map
