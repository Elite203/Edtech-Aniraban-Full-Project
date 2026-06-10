var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Property, ChildProperty, Complex, Event } from '@syncfusion/ej2-base';
import { AjaxSettings, ContextMenuSettings } from '@syncfusion/ej2-filemanager';
import { DetailsViewSettings, NavigationPaneSettings } from '@syncfusion/ej2-filemanager';
import { SearchSettings } from '@syncfusion/ej2-filemanager';
import { ToolbarSettings as FileToolbarSettings } from '@syncfusion/ej2-filemanager';
import { UploadSettings } from '@syncfusion/ej2-filemanager';
/**
 * Configures the file manager settings of the RichTextEditor.
 */
var FileManagerSettings = /** @class */ (function (_super) {
    __extends(FileManagerSettings, _super);
    function FileManagerSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Event()
    ], FileManagerSettings.prototype, "beforeSend", void 0);
    __decorate([
        Complex({ getImageUrl: null, url: null, uploadUrl: null }, AjaxSettings)
    ], FileManagerSettings.prototype, "ajaxSettings", void 0);
    __decorate([
        Property(false)
    ], FileManagerSettings.prototype, "allowDragAndDrop", void 0);
    __decorate([
        Complex({ visible: true, file: ['Open', '|', 'Cut', 'Copy', '|', 'Delete', 'Rename', '|', 'Details'], folder: ['Open', '|', 'Cut', 'Copy', 'Paste', '|', 'Delete', 'Rename', '|', 'Details'], layout: ['SortBy', 'View', 'Refresh', '|', 'Paste', '|', 'NewFolder', 'Upload', '|', 'Details', '|', 'SelectAll'] }, ContextMenuSettings)
    ], FileManagerSettings.prototype, "contextMenuSettings", void 0);
    __decorate([
        Property('')
    ], FileManagerSettings.prototype, "cssClass", void 0);
    __decorate([
        Complex({}, DetailsViewSettings)
    ], FileManagerSettings.prototype, "detailsViewSettings", void 0);
    __decorate([
        Property(false)
    ], FileManagerSettings.prototype, "enable", void 0);
    __decorate([
        Complex({ maxWidth: '650px', minWidth: '240px', visible: true }, NavigationPaneSettings)
    ], FileManagerSettings.prototype, "navigationPaneSettings", void 0);
    __decorate([
        Property('/')
    ], FileManagerSettings.prototype, "path", void 0);
    __decorate([
        Property(null)
    ], FileManagerSettings.prototype, "rootAliasName", void 0);
    __decorate([
        Complex({}, SearchSettings)
    ], FileManagerSettings.prototype, "searchSettings", void 0);
    __decorate([
        Property(true)
    ], FileManagerSettings.prototype, "showFileExtension", void 0);
    __decorate([
        Property(false)
    ], FileManagerSettings.prototype, "showHiddenItems", void 0);
    __decorate([
        Property(true)
    ], FileManagerSettings.prototype, "showThumbnail", void 0);
    __decorate([
        Property('Ascending')
    ], FileManagerSettings.prototype, "sortOrder", void 0);
    __decorate([
        Complex({ visible: true, items: ['NewFolder', 'Upload', 'Cut', 'Copy', 'Paste', 'Delete', 'Download', 'Rename', 'SortBy', 'Refresh', 'Selection', 'View', 'Details'] }, FileToolbarSettings)
    ], FileManagerSettings.prototype, "toolbarSettings", void 0);
    __decorate([
        Complex({ autoUpload: true, minFileSize: 0, maxFileSize: 30000000, allowedExtensions: '', autoClose: false }, UploadSettings)
    ], FileManagerSettings.prototype, "uploadSettings", void 0);
    __decorate([
        Property('LargeIcons')
    ], FileManagerSettings.prototype, "view", void 0);
    return FileManagerSettings;
}(ChildProperty));
export { FileManagerSettings };
