import { IRichTextEditor } from '../base/interface';
import { BeforeSanitizeHtmlArgs, SanitizeRemoveAttrs } from '../../common/interface';
export declare class SanitizeHtmlHelper {
    removeAttrs: SanitizeRemoveAttrs[];
    removeTags: string[];
    wrapElement: HTMLElement;
    initialize(value: string, parent?: IRichTextEditor): string;
    serializeValue(item: BeforeSanitizeHtmlArgs, value: string): string;
    private removeXssTags;
    private removeJsEvents;
    private removeXssAttrs;
}
