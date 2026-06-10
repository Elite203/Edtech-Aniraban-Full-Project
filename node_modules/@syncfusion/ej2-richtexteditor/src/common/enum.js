/**
 * Enumerates the types of dialogs that can be opened or closed in the Rich Text Editor.
 */
export var DialogType;
(function (DialogType) {
    /** Defines DialogType for inserting a link. */
    DialogType["InsertLink"] = "InsertLink";
    /** Defines DialogType for inserting an image. */
    DialogType["InsertImage"] = "InsertImage";
    /** Defines DialogType for inserting audio. */
    DialogType["InsertAudio"] = "InsertAudio";
    /** Defines DialogType for inserting video. */
    DialogType["InsertVideo"] = "InsertVideo";
    /** Defines DialogType for inserting a table. */
    DialogType["InsertTable"] = "InsertTable";
})(DialogType || (DialogType = {}));
/**
 * Enumerates the types of toolbars available.
 */
export var ToolbarType;
(function (ToolbarType) {
    /** Defines ToolbarType as Expand. */
    ToolbarType["Expand"] = "Expand";
    /** Defines ToolbarType as MultiRow. */
    ToolbarType["MultiRow"] = "MultiRow";
    /** Defines ToolbarType as Scrollable. */
    ToolbarType["Scrollable"] = "Scrollable";
    /** Defines ToolbarType as popup. */
    ToolbarType["Popup"] = "Popup";
    /* eslint-enable */
})(ToolbarType || (ToolbarType = {}));
/**
 * Enumerates the sources for images to be inserted.
 */
export var ImageInputSource;
(function (ImageInputSource) {
    /** Defines ImageInputSource as Uploaded. */
    ImageInputSource["Uploaded"] = "Uploaded";
    /** Defines ImageInputSource as Dropped. */
    ImageInputSource["Dropped"] = "Dropped";
    /** Defines ImageInputSource as Pasted. */
    ImageInputSource["Pasted"] = "Pasted";
})(ImageInputSource || (ImageInputSource = {}));
/**
 * Enumerates the sources for media to be inserted.
 */
export var MediaInputSource;
(function (MediaInputSource) {
    /** Defines MediaInputSource as Uploaded. */
    MediaInputSource["Uploaded"] = "Uploaded";
    /** Defines MediaInputSource as Dropped. */
    MediaInputSource["Dropped"] = "Dropped";
    /** Defines MediaInputSource as Pasted. */
    MediaInputSource["Pasted"] = "Pasted";
})(MediaInputSource || (MediaInputSource = {}));
