import { Popup } from '@syncfusion/ej2-popups';
import { IRichTextEditor } from '../base/interface';
import { QuickToolbarType } from '../../common/types';
export declare class QuickPopupRenderer {
    private parent;
    private type;
    private popupElement;
    private popup;
    constructor(parent: IRichTextEditor);
    renderPopup(type: QuickToolbarType): Popup;
    private quickToolbarOpen;
    private createPopup;
}
