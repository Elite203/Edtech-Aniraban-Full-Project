import { createElement, Component } from 'react';
import { RichTextEditor } from '@syncfusion/ej2-richtexteditor';
export * from '@syncfusion/ej2-richtexteditor';
import { applyMixins, ComponentBase } from '@syncfusion/ej2-react-base';
export { Inject } from '@syncfusion/ej2-react-base';

/**
 * `RichTextEditor` represents the react RichTextEditor.
 * ```tsx
 * <RichTextEditor/>
 * ```
 */
class RichTextEditorComponent extends RichTextEditor {
    constructor(props) {
        super(props);
        this.initRenderCalled = false;
        this.checkInjectedModules = true;
        this.statelessTemplateProps = ["valueTemplate"];
        this.templateProps = null;
        this.immediateRender = false;
        this.isReactMock = true;
        this.portals = [];
    }
    render() {
        this.isReactMock = false;
        if (((this.element && !this.initRenderCalled) || this.refreshing) && !this.isReactForeceUpdate) {
            super.render();
            this.initRenderCalled = true;
        }
        else {
            return createElement('div', this.getDefaultAttributes(), [].concat(this.props.children, this.portals));
        }
    }
}
applyMixins(RichTextEditorComponent, [ComponentBase, Component]);

export { RichTextEditorComponent };
//# sourceMappingURL=ej2-react-richtexteditor.es2015.js.map
