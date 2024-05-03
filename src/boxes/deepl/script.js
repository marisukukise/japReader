require("module-alias/register");
const { ipcRenderer } = require("electron");

const tools = require("@tools");
const Store = require("electron-store");

const deepl = require("deepl-node");
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const { useDeepLApi, deepLApiKey } = OPTIONS.get("options");

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    ipcRenderer.on("translateWithDeepL", (event, text) => {
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
            }
          )
          .then(
            (result) =>
              ipcRenderer.send("appendToHistory", currentText, result),
            (error) => console.error(error)
          );
      } else {
        document.location.href = `https://www.deepl.com/translator#ja/en/${currentText}`;
      }
    });

    if (useDeepLApi) {
      const translator = new deepl.Translator(deepLApiKey, {
        maxRetries: 1,
        minTimeout: 3000,
      });
        translator.getUsage().then(() => {
          ipcRenderer.send("deepLConnected");
        }).catch((error) => {
          ipcRenderer.send("deepLConnectionError", error.message);
        })
    } else {
        if (document.body.children.length === 0) {
          ipcRenderer.send("deepLConnectionError", "DeepL page was loaded as empty page");
          return;
        } 

        ipcRenderer.send("deepLConnected");

      try {
        const targetNode = document.body.querySelector(
          '[name="target"] [role="textbox"]'
        );

        if (targetNode === null) {
          throw new Error("English text box could not be found on DeepL page<br>Element query selector is probably wrong or DeepL page has changed its structure.<br>Correct the query selector in options or open an issue on github page.");
        }

        const sourceNode = document.body.querySelector(
          '[name="source"] [role="textbox"]'
        );

        if (sourceNode === null) {
          throw new Error("Japanese text box could not be found on DeepL page<br>Element query selector is probably wrong or DeepL page has changed its structure.<br>Correct the query selector in options or open an issue on github page.");
        }

        const config = { childList: true };
        const callback = () => {
          if (targetNode.textContent || sourceNode.textContent) {
            const deeplText = [...targetNode.children]
              .map((x) => x.textContent)
              .join(" ");
            const japaneseText = [...sourceNode.children]
              .map((x) => x.textContent)
              .join(" ");
            ipcRenderer.send("showTranslation", deeplText, japaneseText);
            ipcRenderer.send("appendToHistory", japaneseText, deeplText);
          }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
      } catch(error) {
        ipcRenderer.send("deepLConnectionError", error.message);
      }
    }
  }
};
