type PlainLangContent = {
  name: "string";
  content: string;
};

type LangContent = {
  name: "string";
  content: {
    [key: string]: string | string[];
  };
};

figma.showUI(__html__);

const esModuleToObj = (str: string) => {
  str = str.replace(/export default\s*/, "");
  const obj = new Function("return " + str)();
  return obj as {
    [key: string]: string | string[];
  };
};

const handleLangContent = (payload: PlainLangContent[]): LangContent[] =>
  payload.map((item) => {
    const { name, content } = item;

    const _newContent = esModuleToObj(content);

    return { name, content: _newContent };
  });

const replaceText = async (
  frame: SceneNode,
  content: { [key: string]: string | string[] }
) => {
  if (frame.type === "TEXT") {
    await figma.loadFontAsync(frame.fontName as FontName);

    let value = content[frame.name] || frame.characters;
    if (value instanceof Array) {
      value = value.join("\n");
    }
    frame.characters = value;
  }
  if ("children" in frame) {
    const children = frame.children;
    for (const childFrame of children) {
      await replaceText(childFrame, content);
    }
  }
};

const contentsToFigma = async (langContents: LangContent[]) => {
  const template = figma.currentPage.selection[0];
  for (const langContent of langContents) {
    const { name, content } = langContent;
    const curFrame = template.clone();
    curFrame.name = name;
    await replaceText(curFrame, content);
  }
};

figma.ui.onmessage = async (msg: {
  type: string;
  payload: PlainLangContent[];
}) => {
  const { type: msgType, payload } = msg;
  if (msgType === "run") {
    const langContents = handleLangContent(payload);

    await contentsToFigma(langContents);
  }

  // figma.closePlugin();
};
