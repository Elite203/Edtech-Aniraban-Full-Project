/**
 *  DOMTreeMethods - A `TreeWalkder` API implementation to get the block and text nodes in the selection.
 */
export declare class DOMMethods {
    private directRangeElems;
    private BLOCK_TAGS;
    /**
     * Refers the `inputElement` of the editor.
     *
     * @hidden
     **/
    editableElement: HTMLDivElement | HTMLBodyElement;
    private currentDocument;
    constructor(editElement: HTMLDivElement | HTMLBodyElement);
    /**
     * Method to get the block nodes inside the given Block node `TreeWalker` API.
     *
     * @returns {HTMLElement[]} The block node element.
     *
     *
     */
    getBlockNode(): HTMLElement[];
    private addToBlockCollection;
    /**
     * Method to get the text nodes inside the given Block node `TreeWalker` API.
     *
     * @param {HTMLElement} blockElem - specifies the parent block element.
     * @returns {Text[]} The Text Nodes.
     *
     *
     */
    getTextNodes(blockElem: HTMLElement): Text[];
    /**
     * isBlockNode method
     *
     * @param {Element} element - specifies the node element.
     * @returns {boolean} - sepcifies the boolean value
     * @hidden
     */
    isBlockNode(element: Element): boolean;
    /**
     * Retrieves the last text node within the provided node and its descendants.
     *
     * This method uses a TreeWalker to traverse all text nodes in the given node's subtree,
     * and returns the last text node found.
     *
     * @param {Node} node - The root node from which to begin searching for text nodes.
     * @returns {Node | null} - The last text node within the node, or null if no text nodes are found.
     */
    getLastTextNode(node: Node): Node | null;
    /**
     * Retrieves the first text node within the provided node and its descendants.
     *
     * This method uses a TreeWalker to traverse all text nodes in the given node's subtree,
     * and returns the first text node found.
     *
     * @param {Node} node - The root node from which to begin searching for text nodes.
     * @returns {Node | null} - The first text node within the node, or null if no text nodes are found.
     */
    getFirstTextNode(node: Node): Node | null;
    /**
     * Retrieves the parent block node of the given inline node.
     *
     * This method uses a TreeWalker to traverse the DOM tree and find the nearest ancestor of the given node
     * that is a block element.
     *
     * @param {Node} node - The node for which to find the parent block node.
     * @returns {Node} - The parent block node of the given node.
     * @hidden
     */
    getParentBlockNode(node: Node): HTMLElement;
    /**
     * Retrieves the top-most node in the DOM that is not a block-level element.
     * If the given text node is part of a block element, it returns the text node itself.
     * Otherwise, it traverses upwards through its parent nodes until it finds a node
     * that is either a block-level node or a node that contains different text content than the provided `text`.
     *
     * @param {Text} text - The text node from which to start the search. This can be a child of an inline element.
     * @returns {HTMLElement | Text} - The top-most parent element that is not a block node, or the text node itself if it's inside a block-level element.
     * @hidden
     *
     */
    getTopMostNode(text: Text): HTMLElement | Text;
    /**
     * Finds the nearest parent `<li>` element of a given node until the search reaches the editable element.
     *
     * @private
     * @param {Node | null} node - The starting node from which to search for the parent `<li>` element.
     * @returns {HTMLLIElement | null} - The nearest parent `<li>` element if found, otherwise `null`.
     */
    private findParentLiElementUntilEditable;
    /**
     * Retrieves all `<li>` elements that are part of the current selection range.
     * This includes `<li>` elements that are fully or partially selected.
     *
     * @private
     * @returns {HTMLLIElement[]} - An array of selected `<li>` elements.
     */
    private getSelectedLiElements;
    /**
     * Retrieves all `<li>` elements within the current selection range,
     * including nested `<li>` elements if they are fully or partially selected.
     *
     * @public
     * @returns {HTMLElement[]} - An array of `<li>` elements found within the selection range.
     */
    getLiElementsInRange(): HTMLElement[];
}
