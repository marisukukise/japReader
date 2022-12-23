require('module-alias/register')
const { ipcRenderer } = require('electron');
const tools = require('@tools');
const Store = require('electron-store')
const OPTIONS = new Store(tools.getOptionsStoreOptions());

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

  let optionsData = OPTIONS.get('options')


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

  handleOptionConflicts();

  document.querySelector('.apply.btn').addEventListener('click', () => {
    Object.entries(optionsData).forEach(([key, value]) => {
      switch (typeof value) {
        case 'boolean':
          optionsData[key] = document.querySelector(`#${key}`).checked;
          break;
        case 'number':
          optionsData[key] = parseInt(document.querySelector(`#${key}`).value);
          break;
        default:
      }
    });

    OPTIONS.set('options', optionsData);

    ipcRenderer.send('restartProgram');
  });
});
