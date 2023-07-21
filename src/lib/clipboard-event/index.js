import { EventEmitter } from 'events';
import path from 'path';
import { execFile } from 'child_process';

class ClipboardEventListener extends EventEmitter {
  constructor() {
    super();
    this.child = null;
  }

  startListening(libPath) {

    const { platform } = process;
    if (platform === 'win32') {
      this.child = execFile(path.join(libPath, 'clipboard-event', 'platform', 'clipboard-event-handler-win32.exe'));
    }
    else if (platform === 'linux') {
      this.child = execFile(path.join(libPath, 'clipboard-event', 'platform', 'clipboard-event-handler-linux'));
    }
    else if (platform === 'darwin') {
      this.child = execFile(path.join(libPath, 'clipboard-event', 'platform', 'clipboard-event-handler-mac'));
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

export default new ClipboardEventListener();