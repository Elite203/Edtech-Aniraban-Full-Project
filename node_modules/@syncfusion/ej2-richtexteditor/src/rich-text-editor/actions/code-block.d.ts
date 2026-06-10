import { IRichTextEditor } from '../base/interface';
/**
 * Code Block module provides functionality for working with code blocks in the Rich Text Editor
 * Handles code block creation, editing, and keypress interactions
 *
 * @constructor CodeBlock
 */
export declare class CodeBlock {
    protected parent: IRichTextEditor;
    private isDestroyed;
    private isItemsDisabled;
    private codeBlockObj;
    /**
     * Creates an instance of CodeBlock module
     *
     * @param {IRichTextEditor} parent - The parent Rich Text Editor instance
     * @returns {void}
     */
    constructor(parent?: IRichTextEditor);
    private addEventListener;
    private onCodeBlock;
    private onPaste;
    private codeBlockEnter;
    private codeBlockTab;
    private onKeyDown;
    private createToolbarItem;
    private processCodeBlockDeletion;
    private createCodeBlockWithDefaultLanguage;
    private isSelectionAllContent;
    private onKeyUp;
    private editAreaClickHandler;
    disableToolbarItems(): void;
    private disableTextQuickToolbarItems;
    protected removeEventListener(): void;
    /**
     * Cleans up resources and detaches event handlers when the component is destroyed
     *
     * @returns {void}
     */
    destroy(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string value
     */
    private getModuleName;
    /**
     * Initializes the CodeBlockPlugin object in the editor manager after editor initialization is complete.
     * This method binds the code block  module to the editor's formatter for handling code block related operations.
     *
     * @returns {void} - This method does not return a value
     * @private
     */
    private bindOnEnd;
}
