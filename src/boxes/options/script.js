require('module-alias/register')
const { ipcRenderer } = require('electron');
const tools = require('@tools');
const Store = require('electron-store')
const fs = require('fs');
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const WINDOW_SETTINGS = new Store(tools.getWindowStoreOptions());
const GOAL_DATA = new Store(tools.getGoalDataStoreOptions());
const STATUS_DATA = new Store(tools.getStatusDataStoreOptions());

const handleCheckbox = (checkbox, enable_query, disable_query) => {
  const enable_inputs = document.querySelectorAll(enable_query)
  const disable_inputs = document.querySelectorAll(disable_query)
  enable_inputs.forEach(input => {
    input.disabled = !checkbox.checked;
  })
  disable_inputs.forEach(input => {
    input.disabled = checkbox.checked;
  })
}

const setOnReadyAndOnClickListener = (checkbox, enable_query, disable_query) => {
  handleCheckbox(checkbox, enable_query, disable_query)
  checkbox.addEventListener('click', () => { handleCheckbox(checkbox, enable_query, disable_query) });
}

const handleOptionConflicts = () => {
  setOnReadyAndOnClickListener(document.querySelector('#useDeepL'),
    '#translation input:not(#useDeepL), #reader input#useReader', null)
  setOnReadyAndOnClickListener(document.querySelector('#useReader'),
    '#reader input:not(#useReader), #translation input#useDeepL, #dictionary input', null)
}

const { optionsFontSize, fontFamily } = OPTIONS.get('options')

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#app').style.fontSize = `${optionsFontSize}pt`;
  document.querySelector('#app').style.fontFamily = `${fontFamily}`;
  // eslint-disable-next-line global-require
  const $ = require('jquery');
  $(window).on('keydown', (e) => {
    switch (e.key) {
      case 'Escape':
        ipcRenderer.send('hideOptions')
        break;
    }
    return true;
  });

  let optionsData = OPTIONS.get('options')


  if (optionsData.darkMode) {
    document.documentElement.classList.add('dark-mode');
  }


  Object.entries(optionsData).forEach(([key, value]) => {
    let element = document.querySelector(`#${key}`);
    switch (typeof value) {
      case 'boolean':
        element.checked = value;
        break;
      case 'number':
        element.value = value;
        break;
      case 'string':
        switch (element.tagName) {
          case 'SELECT':
            element.value = value;
            break;
          default:
        }
        break;
      default:
    }
  });

  handleOptionConflicts();

  document.querySelector('.apply.btn').addEventListener('click', () => {
    ipcRenderer.invoke('showDialog',
      "Are you sure you want to apply settings?")
      .then(result => {
        if (result.response === 0) {
          Object.entries(optionsData).forEach(([key, value]) => {
            let element = document.querySelector(`#${key}`);
            switch (typeof value) {
              case 'boolean':
                optionsData[key] = element.checked;
                break;
              case 'number':
                optionsData[key] = parseInt(element.value);
                break;
              case 'string':
                switch (key) {
                  case 'fontFamily':
                    optionsData[key] = element.value;
                    break;
                  default:
                }
              default:
            }
          });

          OPTIONS.set('options', optionsData);
          ipcRenderer.send('restartProgram');
        }
      });
  });

  document.querySelector('.reset-window-settings.btn').addEventListener('click', () => {
    ipcRenderer.invoke('showDialog',
      "Are you sure you want to reset remembered window configuration to default?")
      .then(result => {
        if (result.response === 0) {
          WINDOW_SETTINGS.clear();
          ipcRenderer.send('restartProgram');
        }
      });
  });

  document.querySelector('.reset-goal-data.btn').addEventListener('click', () => {
    ipcRenderer.invoke('showDialog',
      "Are you sure you want to reset goal data (this will clear every day progress tracking)?")
      .then(result => {
        if (result.response === 0) {
          GOAL_DATA.clear();
          ipcRenderer.send('restartProgram');
        }
      });
  });

  document.querySelector('.reset-status-data.btn').addEventListener('click', () => {
    ipcRenderer.invoke('showDialog',
      "Are you sure you want to reset status data (this will clear the database of seen, known and ignored words)")
      .then(result => {
        if (result.response === 0) {
          STATUS_DATA.clear();
          ipcRenderer.send('restartProgram');
        }
      });
  });

  document.querySelector('.reset-options.btn').addEventListener('click', () => {
    ipcRenderer.invoke('showDialog',
      "Are you sure you want to reset options (all options in this menu) to default?")
      .then(result => {
        if (result.response === 0) {
          OPTIONS.clear();
          ipcRenderer.send('restartProgram');
        }
      });
  });

  document.querySelector('.reset-everything.btn').addEventListener('click', () => {
    ipcRenderer.invoke('showDialog',
      "Are you sure you want to reset ALL settings to default?")
      .then(result => {
        if (result.response === 0) {
          WINDOW_SETTINGS.clear();
          OPTIONS.clear();
          STATUS_DATA.clear();
          GOAL_DATA.clear();
          ipcRenderer.send('restartProgram');
        }
      });
  });

});
