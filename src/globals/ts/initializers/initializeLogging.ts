import { app, dialog } from 'electron';
import mainLog from 'electron-log';
import { JAPREADER_LOGS } from '../other/objects';

export function initializeLogging() {
    mainLog.initialize({ preload: true });

    // LOG LEVELS:
    // .error: on error
    // .warn: on something important that's not an error
    // .info: on things that occur only once, i.e. creating an object
    // .verbose: on things that occur repeatedly, i.e. sending a message
    // .debug: temporarily added for debugging
    // .silly: permanently added for debugging

    mainLog.info('⏳ Starting log initialization...');
    // Reading the log level from the environment variable, and if not applicable, then set default (in else)
    if (['error', 'warn', 'info', 'verbose', 'debug', 'silly'].includes(JAPREADER_LOGS)) {
        // @ts-expect-error Possible values are all valid
        mainLog.transports.file.level = JAPREADER_LOGS;
        // @ts-expect-error Possible values are all valid
        mainLog.transports.console.level = JAPREADER_LOGS;
    } else {
        mainLog.transports.file.level = 'info';
        mainLog.transports.console.level = 'warn';
    }

    mainLog.errorHandler.startCatching({
        showDialog: false,
        onError({ createIssue, error, processType, versions }) {
            if (processType === 'renderer') {
                return;
            }
            dialog.showMessageBox({
                title: 'An error occurred',
                message: error.message,
                detail: error.stack ? error.stack : '',
                type: 'error',
                buttons: ['Ignore', 'Report on github', 'Exit'],
            }).then((result) => {
                if (result.response === 1) {
                    createIssue('https://github.com/marisukukise/japReader/issues/new', {
                        title: `[ERROR] Report for ${versions.app}`,
                        body: 'Error message:\n```' + error.stack + '\n```\n\n' + `OS: ${versions.os}\n\nDescription of what lead to the error:\n\n\n\nAdditional info (optional):\n\n`
                    });
                    return;
                }
                if (result.response === 2) {
                    app.quit();
                }
            });
        }
    });

    mainLog.transports.file.format = '[{y}/{m}/{d} {h}:{i}:{s}.{ms}] [{level}] {scope} {text}';
    const log = mainLog.scope('main');

    log.info('✔️ Logging initialized');
}