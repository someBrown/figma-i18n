"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
const esModuleToObj = (str) => {
    str = str.replace(/export default\s*/, "");
    const obj = new Function("return " + str)();
    return obj;
};
const handleLangContent = (payload) => payload.map((item) => {
    const { name, content, ext } = item;
    let _newContent = {};
    if (ext.endsWith("js")) {
        _newContent = esModuleToObj(content);
    }
    else {
        _newContent = JSON.parse(content);
    }
    return { name, content: _newContent };
});
const replaceText = (frame, content) => __awaiter(void 0, void 0, void 0, function* () {
    if (frame.type === "TEXT") {
        yield figma.loadFontAsync(frame.fontName);
        let value = content[frame.name] || frame.characters;
        if (value instanceof Array) {
            value = value.join("\n");
        }
        frame.characters = value;
    }
    if ("children" in frame) {
        const children = frame.children;
        for (const childFrame of children) {
            yield replaceText(childFrame, content);
        }
    }
});
const contentsToFigma = (langContents) => __awaiter(void 0, void 0, void 0, function* () {
    const template = figma.currentPage.selection[0];
    for (const langContent of langContents) {
        const { name, content } = langContent;
        const curFrame = template.clone();
        curFrame.name = `${template.name}-${name}`;
        yield replaceText(curFrame, content);
    }
});
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const { type: msgType, payload } = msg;
    if (msgType === "run") {
        const langContents = handleLangContent(payload);
        yield contentsToFigma(langContents);
    }
    figma.closePlugin();
});
