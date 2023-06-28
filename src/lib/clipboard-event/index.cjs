const { EventEmitter } = require('events');
const path = require('path');
const { execFile } = require('child_process');

class ClipboardEventListener extends EventEmitter {
  constructor() {
    super();
    this.child = null;
  }

  startListening() {

    const { platform } = process;
    if (platform === 'win32') {
      this.child = execFile(path.join(process.resourcesPath, 'lib', 'clipboard-event', 'platform', 'clipboard-event-handler-win32.exe'));
    }
    else if (platform === 'linux') {
      this.child = execFile(path.join(process.resourcesPath, 'lib', 'clipboard-event', 'platform', 'clipboard-event-handler-linux'));
    }
    else if (platform === 'darwin') {
      this.child = execFile(path.join(process.resourcesPath, 'lib', 'clipboard-event', 'platform', 'clipboard-event-handler-mac'));
    }
    else {
      throw 'Not yet supported';
    }

    this.child.stdout.on('data', (data) => {
      if (data.trim() === 'CLIPBOARD_CHANGE') {
        this.emit('change');
      }
    });

  }

  stopListening() {
    const res = this.child.kill();
    return res;
  }
}

module.exports = new ClipboardEventListener();

// Sample usage
/*
const clipboardListener = require('clipboard-event');

// To start listening
clipboardListener.startListening();

clipboardListener.on('change', () => {
  console.log('Clipboard changed');
});

// To stop listening
clipboardListener.stopListening();
*/
