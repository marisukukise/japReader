require("module-alias/register");

const { ipcRenderer } = require("electron");

const tools = require("@tools");

const Store = require("electron-store");

const OPTIONS = new Store(tools.getOptionsStoreOptions());

let englishText = "";
let japaneseText = "";

window.addEventListener("DOMContentLoaded", () => {
  // eslint-disable-next-line global-require
  const $ = require("jquery");

  let deepLConnected = false;
  let deepLDual = false;
  let onTop = false;
  let showBorders = true;

  ipcRenderer.send("readyTranslation");

  const {
    translationFontSize,
    useDeepLApi,
    fontFamily,
    translationTransparent,
    darkMode,
  } = OPTIONS.get("options");
  if (darkMode) {
    document.documentElement.classList.add("dark-mode");
  }
  document.querySelector("#app").style.fontSize = `${translationFontSize}pt`;
  document.querySelector("#app").style.fontFamily = `${fontFamily}`;

  $(window).on("keydown", (e) => {
    switch (e.key) {
      case "o":
        ipcRenderer.send("openOptions");
        break;
      case "s":
        onTop = tools.toggle_onTop(onTop, $("body"));
        ipcRenderer.send("translationOnTop");
        break;
      case "h":
        if (translationTransparent) {
          if (showBorders) {
            showBorders = false;
            document.body.style.borderStyle = "hidden";
            document.querySelector("#move-bar").style.visibility = "hidden";
          } else {
            showBorders = true;
            document.body.style.borderStyle = "dashed";
            document.querySelector("#move-bar").style.visibility = "visible";
          }
        }
        break;
    }
    return true;
  });

  const options = OPTIONS.get("options");
  deepLDual = options.deepLDual;

  $("#app").html(
    `Connecting to ${
      useDeepLApi
        ? "DeepL API"
        : '<span class="url">https://www.deepl.com/</span>'
    }.`
  );
  $("#app").append("<br>");
  $("#app").append("Please wait patiently...");

  ipcRenderer.on("deepLConnected", () => {
    if (!deepLConnected) {
      deepLConnected = true;
      $("#app").html(
        `Successfully connected to ${
          useDeepLApi
            ? "DeepL API"
            : '<span class="url">https://www.deepl.com/</span>'
        }.`
      );
      $("#app").append("<br>");
      $("#app").append("Copy Japanese text to get DeepL translations.");
      if (useDeepLApi) {
        $("#app").append("<br><br>");
        $("#app").append(
          "You're using DeepL API which has a monthly limit of 500,000 characters. <br> To have unlimited translation consider disabling DeepL API in the options menu."
        );
      }
    }
  });

  ipcRenderer.on("deepLConnectionError", () => {
    $("#app").html(
      `Unable to connect to ${
        useDeepLApi
          ? "DeepL API"
          : '<span class="url">https://www.deepl.com/</span>'
      }.`
    );
    $("#app").append("<br>");
    $("#app").append(
      `Check your internet connection, and make sure ${
        useDeepLApi ? "your API key is correct" : "the site is up"
      }.`
    );
    $("#app").append("<br><br>");
    $("#app").append(
      `Once you ${
        useDeepLApi ? "confirm your API key" : "are able to connect to the site"
      }, restart this program.`
    );
    $("#app").append("<br>");
    $("#app").append("All of your progress will be saved.");
    $("#app").append("<br>");
    $("#app").append(
      "(It is also possible that deepl.com has changed something on its website and it broke japReader, in which case you can open an issue on github or temporarily enable a DeepL API Key in options)"
    );
  });

  ipcRenderer.on("translateNotification", () => {
    $("#app").html("Translating...");
  });

  ipcRenderer.on("fadeText", (event, shouldFade) => {
    if (shouldFade) $("#app").addClass("fade");
    else $("#app").removeClass("fade");
  });

  ipcRenderer.on("tooManyCharacters", () => {
    $("#app").html("Too many characters copied to clipboard...");
    $("#app").append("<br>");
    $("#app").append(
      `No request has been made to ${
        useDeepLApi
          ? "DeepL API"
          : '<span class="url">https://www.deepl.com/</span>'
      }.`
    );
    $("#app").append("<br>");
    $("#app").append(
      "This has been implemented to prevent you from being banned."
    );
  });

  ipcRenderer.on("showTranslation", (event, sourceText, targetText) => {
    englishText = sourceText.replace(/"/g, "");
    japaneseText = targetText;

    if (!deepLDual) $("#app").html(englishText);
    else {
      $("#app").html(`<div id="jap-text">${japaneseText}</div>`);
      $("#app").append(`<div id="english-text">${englishText}</div>`);
    }
  });

  ipcRenderer.on("requestTranslation", () => {
    ipcRenderer.send("sendTranslation", englishText);
  });
});
