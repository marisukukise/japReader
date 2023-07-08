import { app, dialog } from "electron";
import 'dotenv/config';
import log from 'electron-log';


const addColorToLog = (
    message: log.LogMessage,
    color: 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'white',
    otherCSS = ''):
    log.LogMessage => {

    const hasCustomStyles = message.data[0].includes('%c')
    message.data[0] = '%c' + message.data[0]
    if (hasCustomStyles)
        message.data[1] = `color: ${color};${otherCSS};` + message.data[1]
    else
        message.data.splice(1, 0, `color: ${color};${otherCSS};`)
    return message
}

export const createScopedLog = (log: any, scopeName: string): any => {
    log.hooks.push((message: any, transport: any) => {
        if (message) {
        if (transport !== log.transports.console)
            return message

            switch (message.level) {
                case 'error':
                    return addColorToLog(message, 'red', 'font-size: 2rem; font-weight: bold;')
                case 'warn':
                    return addColorToLog(message, 'yellow', 'font-size: 1rem; font-weight: bold;')
                case 'info':
                    return addColorToLog(message, 'white')
                case 'debug':
                    return addColorToLog(message, 'green')
                case 'verbose':
                    return addColorToLog(message, 'cyan', 'font-size: 0.75rem;')
                case 'silly':
                    return addColorToLog(message, 'black', 'font-size: 0.75rem;')
                default:
                    return message;
            }
        }
        else return message;
    });
    const newLog = log.scope(scopeName)
    return newLog;
}


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

    log.transports.file.format = '[{y}/{m}/{d} {h}:{i}:{s}.{ms}] [{level}] {scope} {text}';
    const mainLog = createScopedLog(log, 'main');

    mainLog.info("Logging initialized")
}