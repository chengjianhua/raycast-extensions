import React from "react";
import { getSelectedText, Clipboard, Detail } from "@raycast/api";
import { jsonrepair } from "jsonrepair";

export default function main() {
  const [inputText, setInputText] = React.useState<string>();
  const [selectedText, setSelectedText] = React.useState<string>();
  const [clipboardContent, setClipboardContent] = React.useState<string>();

  React.useEffect(() => {
    // setInputText(defaultText);

    (async () => {
      const [clipboardContent, selectedText] = await Promise.all([
        Clipboard.readText(),
        getSelectedText().catch(() => null),
      ]);
      setSelectedText(selectedText!);
      setClipboardContent(clipboardContent);
      setInputText(selectedText || clipboardContent || "");
    })();
  }, []);

  const json = React.useMemo(() => {
    if (inputText === undefined) return {};

    const jsonList = parseJsonFromText(inputText);
    return jsonList;
  }, [inputText]);

  return (
    <Detail
      markdown={`
## cURL

\`\`\`
${JSON.stringify(json, null, 2)}
\`\`\`

## Clipboard

${clipboardContent}

## Selected

${selectedText}

## Raw
${inputText}
    `}
    />
  );
}

function parseJsonFromText(text: string) {
  const jsonList = extractNestedBrackets(text);
  console.log("json list", jsonList);

  const objects = jsonList.map((json) => {
    try {
      return JSON.parse(jsonrepair(json));
    } catch (error) {
      console.error(error);
      return null;
    }
  });
  console.log("objects", objects);

  return objects;
}

function matchBrackets(str: string, startIndex = 0) {
  let bracketCount = 0;
  let endIndex = startIndex;
  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];
    endIndex = i;
    if (char === "{") {
      bracketCount++;
    } else if (char === "}") {
      bracketCount--;
    }
    if (bracketCount === 0) {
      break;
    }
  }
  return str.substring(startIndex, endIndex + 1);
}

function extractNestedBrackets(str: string) {
  const result = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === "{") {
      const bracketString = matchBrackets(str, i);
      result.push(bracketString);
      i += bracketString.length;
    } else {
      i++;
    }
  }
  return result;
}
