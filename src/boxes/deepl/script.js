require("module-alias/register");
const { ipcRenderer } = require("electron");

const tools = require("@tools");
const Store = require("electron-store");

const deepl = require("deepl-node");
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const { useDeepLApi, deepLApiKey, deepLSourceNode, deepLTargetNode } =
  OPTIONS.get("options");

const getTargetNode = () => {
  const targetNode = document.body.querySelector(deepLTargetNode);

  if (targetNode === null) {
    throw new Error(
      "English text box could not be found on DeepL page<br>Element query selector is probably wrong or DeepL page has changed its structure.<br>Correct the query selector in options (by using inspect element on deepl.com/translator page) or open an issue on github page.",
    );
  }

  return targetNode;
};

const getSourceNode = () => {
  const sourceNode = document.body.querySelector(deepLSourceNode);

  if (sourceNode === null) {
    throw new Error(
      "Japanese text box could not be found on DeepL page<br>Element query selector is probably wrong or DeepL page has changed its structure.<br>Correct the query selector in options (by using inspect element on deepl.com/translator page) or open an issue on github page.",
    );
  }
  return sourceNode;
};

const getTextContent = (node) => node.textContent.trim();

const getOnelineNodeText = (node) =>
  [...node.children].map(({ textContent }) => textContent).join(" ");

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    ipcRenderer.on("translateWithDeepL", (_event, text) => {
      ipcRenderer.send("translateNotification");
      const currentText = text.replace(/…+/, "…").replace(/・+/g, "…");

      if (useDeepLApi) {
        const translator = new deepl.Translator(deepLApiKey);
        translator
          .translateText(currentText, "ja", "en-US")
          .then(
            (result) => {
              ipcRenderer.send("showTranslation", result.text, currentText);
              return result.text;
            },
            (error) => {
              ipcRenderer.send("deepLConnectionError", error.message);
            },
          )
          .then(
            (result) =>
              ipcRenderer.send("appendToHistory", currentText, result),
            (error) => console.error(error),
          );
      } else {
        const sourceNode = getSourceNode();
        sourceNode.textContent = currentText;
        sourceNode.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    if (useDeepLApi) {
      const translator = new deepl.Translator(deepLApiKey, {
        maxRetries: 1,
        minTimeout: 3000,
      });
      translator
        .getUsage()
        .then(() => {
          ipcRenderer.send("deepLConnected");
        })
        .catch((error) => {
          ipcRenderer.send("deepLConnectionError", error.message);
        });
    } else {
      if (document.body.children.length === 0) {
        ipcRenderer.send(
          "deepLConnectionError",
          "DeepL page was loaded as empty page",
        );
        return;
      }

      try {
        getTargetNode();
        getSourceNode();

        let targetNode, sourceNode;

        setTimeout(() => {
          const observer = new MutationObserver(() => {
            if (!getTextContent(targetNode) && !getTextContent(sourceNode)) {
              return;
            }

            const deeplText = getOnelineNodeText(targetNode);
            const japaneseText = getOnelineNodeText(sourceNode);

            ipcRenderer.send("showTranslation", deeplText, japaneseText);
            ipcRenderer.send("appendToHistory", japaneseText, deeplText);
          });

          targetNode = getTargetNode();
          sourceNode = getSourceNode();

          if (targetNode && sourceNode) {
            observer.observe(targetNode, { childList: true });
            ipcRenderer.send("deepLConnected");
          }
        }, 1000);
      } catch (error) {
        ipcRenderer.send("deepLConnectionError", error.message);
      }
    }
  }
};
