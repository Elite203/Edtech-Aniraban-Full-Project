import { addClass, isNullOrUndefined as isNOU, removeClass } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import { FormatPainterActions } from '../../editor-manager/plugin/format-painter-actions';
var FormatPainter = /** @class */ (function () {
    function FormatPainter(parent) {
        this.isSticky = false;
        this.isActive = false;
        this.parent = parent;
        this.addEventListener();
        this.isDestroyed = false;
    }
    FormatPainter.prototype.addEventListener = function () {
        this.parent.on(events.formatPainterClick, this.toolbarClick, this);
        this.parent.on(events.formatPainterDoubleClick, this.toolbarDoubleClick, this);
        this.parent.on(events.editAreaClick, this.editAreaClick, this);
        this.parent.on(events.keyDown, this.onKeyDown, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.parent.on(events.bindOnEnd, this.bindOnEnd, this);
    };
    FormatPainter.prototype.bindOnEnd = function () {
        if (!this.parent.formatter.editorManager.formatPainterObj) {
            this.parent.formatter.editorManager.formatPainterObj =
                new FormatPainterActions(this.parent.formatter.editorManager, this.parent.formatPainterSettings);
        }
    };
    FormatPainter.prototype.toolbarClick = function (clickargs) {
        this.parent.focusIn();
        if (!this.isSticky) {
            this.isActive = true;
            this.actionHandler(clickargs, 'click');
        }
        else {
            // Handling the format painter double click toolbar esape action
            clickargs.args.action = 'escape';
            this.actionHandler(clickargs, 'keyBoard');
        }
        if (this.parent.quickToolbarModule && !isNOU(this.parent.quickToolbarSettings.text) &&
            this.parent.quickToolbarModule.textQTBar &&
            this.parent.element.ownerDocument.contains(this.parent.quickToolbarModule.textQTBar.element)) {
            this.parent.quickToolbarModule.textQTBar.hidePopup();
        }
    };
    FormatPainter.prototype.toolbarDoubleClick = function (args) {
        this.isActive = true;
        this.isSticky = true;
        this.parent.focusIn();
        this.actionHandler(args, 'dbClick');
    };
    FormatPainter.prototype.onKeyDown = function (event) {
        var originalEvent = event.args;
        if (!isNOU(originalEvent) && !isNOU(originalEvent.action) && (originalEvent.action === 'format-copy' || originalEvent.action === 'format-paste')
            || (originalEvent.action === 'escape' && (this.previousAction === 'format-copy' || this.previousAction === 'format-paste'))) {
            if ((originalEvent.action === 'format-copy' || originalEvent.action === 'format-paste')) {
                originalEvent.stopPropagation();
            }
            if (this.parent.userAgentData.getBrowser() === 'Firefox' || this.parent.userAgentData.getBrowser() === 'Safari') {
                originalEvent.preventDefault();
            }
            this.actionHandler(event, 'keyBoard');
        }
    };
    FormatPainter.prototype.actionHandler = function (event, type) {
        var action;
        var isKeyboard = false;
        var originalEvent;
        var args;
        var item;
        switch (type) {
            case 'dbClick':
                args = event.args;
                item = args.item;
                originalEvent = event.args.originalEvent;
                action = 'format-copy';
                break;
            case 'keyBoard':
                args = null;
                originalEvent = event.args;
                isKeyboard = true;
                action = event.args.action;
                if (action === 'escape') {
                    this.isSticky = false;
                    this.isActive = false;
                }
                break;
            case 'click':
                args = event.args;
                item = args.item;
                originalEvent = event.args.originalEvent;
                action = 'format-copy';
                break;
            case 'docClick':
                originalEvent = event;
                action = 'format-paste';
                break;
        }
        if (isNOU(item)) {
            item = {
                command: 'FormatPainter',
                subCommand: 'FormatPainter'
            };
        }
        var actionBeginArgs = {
            requestType: 'FormatPainter', originalEvent: originalEvent, name: action, item: item
        };
        var value = {
            formatPainterAction: action
        };
        this.parent.formatter.process(this.parent, actionBeginArgs, originalEvent, value);
        if (!actionBeginArgs.cancel) {
            this.updateCursor(isKeyboard);
            var enable = type === 'docClick' || action === 'escape' ? false : true;
            this.updateToolbarBtn(enable);
        }
        this.previousAction = action;
    };
    FormatPainter.prototype.updateCursor = function (isKeyboard) {
        if (!this.parent.inputElement.classList.contains('e-rte-cursor-brush') && !isKeyboard) {
            addClass([this.parent.inputElement], 'e-rte-cursor-brush');
        }
        else if (!this.isSticky) {
            removeClass([this.parent.inputElement], 'e-rte-cursor-brush');
        }
    };
    FormatPainter.prototype.updateToolbarBtn = function (enable) {
        if (!isNOU(this.parent.element.querySelector('.e-rte-format-painter'))) {
            var toolbarBtn = this.parent.element.querySelector('.e-rte-format-painter').parentElement.parentElement;
            if (enable) {
                addClass([toolbarBtn], 'e-active');
            }
            else if (!this.isSticky) {
                removeClass([toolbarBtn], 'e-active');
            }
        }
    };
    FormatPainter.prototype.editAreaClick = function (args) {
        if (this.isActive) {
            if (!this.isSticky) {
                this.isActive = false;
            }
            this.actionHandler(args, 'docClick');
            this.updateToolbarBtn(false);
        }
    };
    FormatPainter.prototype.destroy = function () {
        if (this.isDestroyed) {
            return;
        }
        this.parent.off(events.formatPainterClick, this.toolbarClick);
        this.parent.off(events.editAreaClick, this.editAreaClick);
        this.parent.off(events.formatPainterDoubleClick, this.toolbarDoubleClick);
        this.parent.off(events.keyDown, this.onKeyDown);
        this.parent.off(events.destroy, this.destroy);
        this.parent.off(events.bindOnEnd, this.bindOnEnd);
        this.parent = null;
        this.isSticky = null;
        this.isActive = null;
        this.previousAction = null;
        this.isDestroyed = true;
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    FormatPainter.prototype.getModuleName = function () {
        return 'formatPainter';
    };
    return FormatPainter;
}());
export { FormatPainter };
