require('module-alias/register')
const { ipcRenderer } = require('electron');
const tools = require('@tools');
const Store = require('electron-store')
const USER_SETTINGS = new Store(tools.getUserStoreOptions());

window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');
  $(window).on('keyup', (e) => {
    switch (e.key) {
      case 'Escape':
        ipcRenderer.send('hideOptions');
        break;
    }
    return true;
  });

  let optionsData = USER_SETTINGS.get('options')


  if (optionsData.darkMode) {
    document.documentElement.classList.add('dark-mode');
  }

  Object.entries(optionsData).forEach(([key, value]) => {
    switch (typeof value) {
      case 'boolean':
        document.querySelector(`#${key}`).checked = value;
        break;
      case 'number':
        document.querySelector(`#${key}`).value = value;
        break;
      default:
    }
  });

  let newOptionsData = {}

  document.querySelector('.apply.btn').addEventListener('click', () => {
    Object.entries(optionsData).forEach(([key, value]) => {
      switch (typeof value) {
        case 'boolean':
          newOptionsData[key] = document.querySelector(`#${key}`).checked;
          break;
        case 'number':
          newOptionsData[key] = document.querySelector(`#${key}`).value;
          break;
        default:
      }
    });

    USER_SETTINGS.set('options', newOptionsData);

    ipcRenderer.send('restartProgram');
  });
});
