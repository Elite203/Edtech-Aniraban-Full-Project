import { IEditorModel } from '../../common/interface';
export declare class EmojiPickerAction {
    private parent;
    constructor(parent?: IEditorModel);
    private addEventListener;
    private removeEventListener;
    private emojiInsert;
    private beforeApplyFormat;
    destroy(): void;
}
