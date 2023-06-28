# node-clipboard-event
Clipboard change event for Node.js/Electron.js/NW.js

Note:
* It's not being polled
* [This implementation is based on child_process. A native node module using N-API is being developed.](https://github.com/sudhakar3697/node-clipboard-event/tree/v2)

Usage

```
import clipboardListener from 'clipboard-event'

// In case of CommonJS
// const clipboardListener = require('clipboard-event');

// To start listening
clipboardListener.startListening();

clipboardListener.on('change', () => {
    console.log('Clipboard changed');
});

// To stop listening
clipboardListener.stopListening();

```
Motivation

* https://github.com/electron/electron/issues/2280
* https://github.com/DoumanAsh/clipboard-master
* https://github.com/aweinstock314/rust-clipboard/issues/48

Credits

* Linux-  https://stackoverflow.com/a/44992967
* Windows- https://gist.github.com/glombard/7986317 & https://stackoverflow.com/questions/17762037/error-while-trying-to-copy-string-to-clipboard
* MAC- http://www.alecjacobson.com/weblog/?p=2376 & https://gist.github.com/Daemon-Devarshi/13efd24f027a775ee862 & https://developer.apple.com/documentation/appkit/nspasteboard?language=occ

