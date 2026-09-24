import { AriaGridListProps } from "@react-aria/gridlist";
import { AriaLabelingProps, CollectionBase, DOMAttributes, DOMProps, HelpTextProps, Key, KeyboardDelegate, LabelableProps, MultipleSelection, RefObject, SelectionBehavior, FocusableElement, Node } from "@react-types/shared";
import { ListState } from "@react-stately/list";
import { ReactNode } from "react";
import { AriaButtonProps } from "@react-types/button";
import { SelectableItemStates } from "@react-aria/selection";
export interface TagGroupAria {
    /** Props for the tag grouping element. */
    gridProps: DOMAttributes;
    /** Props for the tag group's visible label (if any). */
    labelProps: DOMAttributes;
    /** Props for the tag group description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the tag group error message element, if any. */
    errorMessageProps: DOMAttributes;
}
export interface AriaTagGroupProps<T> extends CollectionBase<T>, MultipleSelection, Pick<AriaGridListProps<T>, 'escapeKeyBehavior'>, DOMProps, LabelableProps, AriaLabelingProps, Omit<HelpTextProps, 'errorMessage'> {
    /** How multiple selection should behave in the collection. */
    selectionBehavior?: SelectionBehavior;
    /** Whether selection should occur on press up instead of press down. */
    shouldSelectOnPressUp?: boolean;
    /** Handler that is called when a user deletes a tag.  */
    onRemove?: (keys: Set<Key>) => void;
    /** An error message for the field. */
    errorMessage?: ReactNode;
    /**
     * Whether pressing the escape key should clear selection in the TagGroup or not.
     *
     * Most experiences should not modify this option as it eliminates a keyboard user's ability to
     * easily clear selection. Only use if the escape key is being handled externally or should not
     * trigger selection clearing contextually.
     * @default 'clearSelection'
     */
    escapeKeyBehavior?: 'clearSelection' | 'none';
}
interface AriaTagGroupOptions<T> extends Omit<AriaTagGroupProps<T>, 'children'> {
    /**
     * An optional keyboard delegate to handle arrow key navigation,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
}
/**
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items, with support for keyboard navigation, selection, and removal.
 * @param props - Props to be applied to the tag group.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag group.
 */
export function useTagGroup<T>(props: AriaTagGroupOptions<T>, state: ListState<T>, ref: RefObject<HTMLElement | null>): TagGroupAria;
export interface TagAria extends Omit<SelectableItemStates, 'hasAction'> {
    /** Props for the tag row element. */
    rowProps: DOMAttributes;
    /** Props for the tag cell element. */
    gridCellProps: DOMAttributes;
    /** Props for the tag remove button. */
    removeButtonProps: AriaButtonProps;
    /** Whether the tag can be removed. */
    allowsRemoving: boolean;
}
export interface AriaTagProps<T> {
    /** An object representing the tag. Contains all the relevant information that makes up the tag. */
    item: Node<T>;
}
/**
 * Provides the behavior and accessibility implementation for a tag component.
 * @param props - Props to be applied to the tag.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag.
 */
export function useTag<T>(props: AriaTagProps<T>, state: ListState<T>, ref: RefObject<FocusableElement | null>): TagAria;

//# sourceMappingURL=types.d.ts.map
