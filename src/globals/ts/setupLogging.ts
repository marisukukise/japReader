import { app, dialog } from "electron";
import 'dotenv/config';
import log, { LogMessage } from 'electron-log';

export function setupLogging() {
    log.initialize({ preload: true });

    // Reading the log level from the environment variable, and if not applicable, then set default (in else)
    if (["error", "warn", "info", "verbose", "debug", "silly"].includes(process.env.JAPREADER_LOGS)) {
        // @ts-expect-error Possible values are all valid
        log.transports.file.level = process.env.JAPREADER_LOGS;
        // @ts-expect-error Possible values are all valid
        log.transports.console.level = process.env.JAPREADER_LOGS;
    } else {
        log.transports.file.level = "info";
        log.transports.console.level = "warn";
    }

    log.errorHandler.startCatching({
        showDialog: false,
        onError({ createIssue, error, processType, versions }) {
            if (processType === 'renderer') {
                return;
            }
            dialog.showMessageBox({
                title: 'An error occurred',
                message: error.message,
                detail: error.stack,
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


    log.debug("Logging initialized")
}