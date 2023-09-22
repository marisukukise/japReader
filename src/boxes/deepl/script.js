require("module-alias/register");
const { ipcRenderer } = require("electron");

const tools = require("@tools");
const Store = require("electron-store");

const deepl = require("deepl-node");
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const HISTORY = new Store(tools.getHistoryLogsOptions());
const { useDeepLApi, deepLApiKey } = OPTIONS.get("options");

if (useDeepLApi) {
  try {
    const translator = new deepl.Translator(deepLApiKey);
  } catch (error) {
    ipcRenderer.send("deepLConnectionError");
    console.error(error);
  }
}

const appendToHistory = (originalText, translation) => {
  if (typeof translation !== "string") result = null;
  const entry = {
    timestamp: Date.now(),
    japanese: originalText,
    translation: translation,
  };

  const list = HISTORY.get("history");

  if (list) HISTORY.set("history", list.concat(entry));
  else HISTORY.set("history", [entry]);
};

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
              ipcRenderer.send("deepLConnectionError");
              console.error(error);
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
        minTimeout: 2000,
      });
      const connectionCheck = setTimeout(() => {
        translator.getUsage().then((e) => {
          ipcRenderer.send("deepLConnected");
          clearInterval(connectionCheck);
        });
      }, 500);

      setTimeout(() => {
        if (deepLApiKey == "") {
          ipcRenderer.send("deepLConnectionError");
        } else {
          translator.getUsage().catch((err) => {
            ipcRenderer.send("deepLConnectionError");
          });
        }
      }, 8000);
    } else {
      const connectionCheck = setTimeout(() => {
        if (document.querySelector('section[aria-labelledby="text-translator-section-heading"]')) {
          ipcRenderer.send("deepLConnected");
          clearInterval(connectionCheck);
        }
      }, 500);

      setTimeout(() => {
        if (document.body.children.length === 0) {
          ipcRenderer.send("deepLConnectionError");
        }
      }, 8000);

      try {
        const targetNode = document.body.querySelector(
          'div[aria-labelledby="translation-target-heading"]'
        );
        const sourceNode = document.body.querySelector(
          'div[aria-labelledby="translation-source-heading"]'
        );
        console.log("e");
        console.log(targetNode, sourceNode)

        const config = { childList: true };
        const callback = () => {
          if (targetNode.textContent) {
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
      } catch (error) {
        ipcRenderer.send("deepLConnectionError");
      }
    }
  }
};
