require("module-alias/register");
const { ipcRenderer } = require("electron");
const tools = require("@tools");
const Store = require("electron-store");
const deepl = require("deepl-node");
const fs = require("fs");
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const WINDOW_SETTINGS = new Store(tools.getWindowStoreOptions());
const GOAL_DATA = new Store(tools.getGoalDataStoreOptions());
const STATUS_DATA = new Store(tools.getStatusDataStoreOptions());
const HISTORY = new Store(tools.getHistoryLogsOptions());

const handleCheckbox = (checkbox, enable_query, disable_query) => {
  const enable_inputs = document.querySelectorAll(enable_query);
  const disable_inputs = document.querySelectorAll(disable_query);
  enable_inputs.forEach((input) => {
    input.disabled = !checkbox.checked;
  });
  disable_inputs.forEach((input) => {
    input.disabled = checkbox.checked;
  });
};

const setOnReadyAndOnClickListener = (
  checkbox,
  enable_query,
  disable_query,
) => {
  handleCheckbox(checkbox, enable_query, disable_query);
  checkbox.addEventListener("click", () => {
    handleCheckbox(checkbox, enable_query, disable_query);
  });
};

const handleOptionConflicts = () => {
  setOnReadyAndOnClickListener(
    document.querySelector("#ankiIntegration"),
    "#anki input:not(#ankiIntegration)",
    null,
  );
  setOnReadyAndOnClickListener(
    document.querySelector("#useDeepL"),
    "#translation input:not(#useDeepL, #deepLApiKey), #reader input#useReader",
    null,
  );
  setOnReadyAndOnClickListener(
    document.querySelector("#useReader"),
    "#reader input:not(#useReader), #translation input#useDeepL, #dictionary input",
    null,
  );
  setOnReadyAndOnClickListener(
    document.querySelector("#showGoal"),
    "#dictionary #dailyGoal",
    null,
  );
};

const { optionsFontSize, fontFamily } = OPTIONS.get("options");

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#app").style.fontSize = `${optionsFontSize}pt`;
  document.querySelector("#app").style.fontFamily = `${fontFamily}`;
  // eslint-disable-next-line global-require
  const $ = require("jquery");
  $(window).on("keydown", (e) => {
    switch (e.key) {
      case "Escape":
        ipcRenderer.send("hideOptions");
        break;
    }
    return true;
  });

  let optionsData = OPTIONS.get("options");

  if (optionsData.darkMode) {
    document.documentElement.classList.add("dark-mode");
  }

  Object.entries(optionsData).forEach(([key, value]) => {
    let element = document.querySelector(`#${key}`);
    if (!element) return;
    switch (typeof value) {
      case "boolean":
        element.checked = value;
        break;
      case "number":
        element.value = value;
        break;
      case "string":
        switch (element.tagName) {
          case "SELECT":
            element.value = value;
            break;
          case "INPUT":
            element.value = value;
            break;
          default:
        }
        break;
      default:
    }
  });

  handleOptionConflicts();

  document.querySelector(".apply.btn").addEventListener("click", () => {
    ipcRenderer
      .invoke("showDialog", "Are you sure you want to apply settings?")
      .then((result) => {
        if (result.response === 0) {
          Object.entries(optionsData).forEach(([key, value]) => {
            let element = document.querySelector(`#${key}`);
            if (!element) {
              delete optionsData[key];
              return;
            }
            switch (typeof value) {
              case "boolean":
                optionsData[key] = element.checked;
                break;
              case "number":
                optionsData[key] = parseInt(element.value);
                break;
              case "string":
                optionsData[key] = element.value;
              default:
            }
          });

          OPTIONS.set("options", optionsData);
          ipcRenderer.send("restartProgram");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

  document
    .querySelector("#openConfigFolder-button > .btn")
    .addEventListener("click", () => {
      const dirname = require("path").dirname(OPTIONS.path);
      ipcRenderer.send("openPath", dirname);
    });

  document
    .querySelector("#openLogsFolder-button > .btn")
    .addEventListener("click", () => {
      const dirname = require("path").dirname(HISTORY.path);
      ipcRenderer.send("openPath", dirname);
    });

  document
    .querySelector("#deepLApiKey-button > .btn")
    .addEventListener("click", () => {
      const responseSelector = document.querySelector(
        ".deepLApiKey-button-response",
      );
      const authKey = document.querySelector("#deepLApiKey").value;
      if (authKey == "") {
        responseSelector.value = `❌Something went wrong`;
        console.error("auth_key cannot be empty");
        return;
      }
      const translator = new deepl.Translator(authKey);
      translator
        .getUsage()
        .then((e) => {
          responseSelector.value = `✅Monthly usage: ${e.character.count}/${e.character.limit}`;
        })
        .catch((e) => {
          responseSelector.value = `❌Something went wrong`;
          console.error(e);
        });
    });
  document
    .querySelector(".reset-window-settings.btn")
    .addEventListener("click", () => {
      ipcRenderer
        .invoke(
          "showDialog",
          "Are you sure you want to reset remembered window configuration to default?",
        )
        .then((result) => {
          if (result.response === 0) {
            WINDOW_SETTINGS.clear();
            ipcRenderer.send("restartProgram");
          }
        });
    });

  document
    .querySelector(".reset-goal-data.btn")
    .addEventListener("click", () => {
      ipcRenderer
        .invoke(
          "showDialog",
          "Are you sure you want to reset goal data (this will clear every day progress tracking)?",
        )
        .then((result) => {
          if (result.response === 0) {
            GOAL_DATA.clear();
            ipcRenderer.send("restartProgram");
          }
        });
    });

  document
    .querySelector(".reset-status-data.btn")
    .addEventListener("click", () => {
      ipcRenderer
        .invoke(
          "showDialog",
          "Are you sure you want to reset status data (this will clear the database of seen, known and ignored words)",
        )
        .then((result) => {
          if (result.response === 0) {
            STATUS_DATA.clear();
            ipcRenderer.send("restartProgram");
          }
        });
    });

  document.querySelector(".reset-options.btn").addEventListener("click", () => {
    ipcRenderer
      .invoke(
        "showDialog",
        "Are you sure you want to reset options (all options in this menu) to default?",
      )
      .then((result) => {
        if (result.response === 0) {
          OPTIONS.clear();
          ipcRenderer.send("restartProgram");
        }
      });
  });

  document.querySelector(".reset-history.btn").addEventListener("click", () => {
    ipcRenderer
      .invoke(
        "showDialog",
        "Are you sure you want to reset history logs (clear all saved logs of your search queries) to default?",
      )
      .then((result) => {
        if (result.response === 0) {
          HISTORY.clear();
          ipcRenderer.send("restartProgram");
        }
      });
  });

  document
    .querySelector(".reset-everything.btn")
    .addEventListener("click", () => {
      ipcRenderer
        .invoke(
          "showDialog",
          "Are you sure you want to reset ALL settings to default?",
        )
        .then((result) => {
          if (result.response === 0) {
            WINDOW_SETTINGS.clear();
            OPTIONS.clear();
            STATUS_DATA.clear();
            GOAL_DATA.clear();
            HISTORY.clear();
            ipcRenderer.send("restartProgram");
          }
        });
    });
});
