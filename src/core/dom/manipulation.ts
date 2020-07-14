import { isArrayLike, isHTMLElement } from 'core/utils/types';
import { each } from 'core/utils/arrays';
import { parent } from 'core/dom/traversal';

type NodeCollection = ArrayLike<Node> | Node | undefined | null;

/**
 * Inserts Nodes before the given preferredAnchor element.
 * @param parent The parent of the preferredAnchor element or the element which shall be the parent of the inserted Nodes.
 * @param preferredAnchor The element before which the Nodes shall be inserted or null if the elements shall be appended at the end.
 * @param insertedElms The Nodes which shall be inserted.
 */
const before: (parent: Node | null, preferredAnchor: Node | null, insertedElms: NodeCollection) => void = (parent, preferredAnchor, insertedElms) => {
    if (insertedElms) {
        let anchor: Node | null = preferredAnchor;
        let fragment: DocumentFragment | Node | undefined | null;

        // parent must be defined
        if (parent) {
            if (isArrayLike(insertedElms)) {
                fragment = document.createDocumentFragment();

                // append all insertedElms to the fragment and if one of these is the anchor, change the anchor
                each(insertedElms, (insertedElm) => {
                    if (insertedElm === anchor) {
                        anchor = insertedElm.previousSibling;
                    }
                    fragment!.appendChild(insertedElm);
                });
            }
            else {
                fragment = insertedElms;
            }

            // if the preferred anchor isn't null set it to a valid anchor
            if (preferredAnchor) {
                if (!anchor) {
                    anchor = parent.firstChild;
                }
                else if (anchor !== preferredAnchor) {
                    anchor = anchor.nextSibling;
                }
            }

            parent.insertBefore(fragment, anchor);
        }
    }
}

/**
 * Appends the given children at the end of the given Node.
 * @param node The Node to which the children shall be appended.
 * @param children The Nodes which shall be appended.
 */
export const appendChildren: (node: Node | null, children: NodeCollection) => void = (node, children) => { before(node, null, children) };

/**
 * Prepends the given children at the start of the given Node.
 * @param node The Node to which the children shall be prepended.
 * @param children The Nodes which shall be prepended.
 */
export const prependChildren: (node: Node | null, children: NodeCollection) => void = (node, children) => { before(node, node && node.firstChild, children) };

/**
 * Inserts the given Nodes before the given Node.
 * @param node The Node before which the given Nodes shall be inserted.
 * @param insertedNodes The Nodes which shall be inserted.
 */
export const insertBefore: (node: Node | null, insertedNodes: NodeCollection) => void = (node, insertedNodes) => { before(parent(node), node, insertedNodes) };

/**
 * Inserts the given Nodes after the given Node.
 * @param node The Node after which the given Nodes shall be inserted.
 * @param insertedNodes The Nodes which shall be inserted.
 */
export const insertAfter: (node: Node | null, insertedNodes: NodeCollection) => void = (node, insertedNodes) => { before(parent(node), node && node.nextSibling, insertedNodes) };

/**
 * Removes the given Nodes from their parent.
 * @param nodes The Nodes which shall be removed.
 */
export const removeElements: (nodes: NodeCollection) => void = (nodes) => {
    if (isArrayLike(nodes)) {
        each(Array.from(nodes), (e) => removeElements(e));
    }
    else if (nodes) {
        const parentNode = nodes.parentNode;
        if (parentNode)
            parentNode.removeChild(nodes);
    }
}