import { ipcRenderer } from 'electron';
import React, { ReactNode, useEffect } from 'react';
import log from 'electron-log/renderer';
import { getStatusDataStore, getWindowStore } from '@globals/ts/main/initializeStore';
const statusDataStore = getStatusDataStore();
const windowStore = getWindowStore();

const { fit } = require('furigana');
import { IPC_CHANNELS, STATUS } from '@globals/ts/main/objects';
import { ToastLayout } from '@geist-ui/core';
import Logger from 'electron-log';

const DIGIT_MAP = [
    ['０', '零'],
    ['１', '一'],
    ['２', '二'],
    ['３', '三'],
    ['４', '四'],
    ['５', '五'],
    ['６', '六'],
    ['７', '七'],
    ['８', '八'],
    ['９', '九'],
];

const getFuriganaObject = (w: string, r: string): japReader.FuriganaObject[] => {
    try {
        if (/[０-９]/.test(w)) {
            const original_w = w;
            DIGIT_MAP.forEach((digit_entry: string[]) => {
                w = w.replace(digit_entry[0], digit_entry[1]);
            });
            const furigana = fit(w, r, { type: 'object' });
            furigana.w = original_w;
            return furigana;
        } else {
            return fit(w, r, { type: 'object' });
        }
    } catch (err) {
        log.error(err);
    }
};

type FuriganaJSXFromFuriganaObjectProps = {
    furiganaList: japReader.FuriganaObject[]
}
const FuriganaJSXFromFuriganaObject = ({ furiganaList }: FuriganaJSXFromFuriganaObjectProps): JSX.Element => {
    return (<>{
        furiganaList.map((furiganaEntry: japReader.FuriganaObject, index: number) => {
            return <ruby key={index}>
                {
                    furiganaEntry.w.match(/\p{Script=Han}/u) ?
                        <>{furiganaEntry.w}<rp>（</rp><rt>{furiganaEntry.r}</rt><rp>）</rp></> :
                        <>{furiganaEntry.w}</>
                }
            </ruby>;
        })
    }</>);
};

type FuriganaJSXProps = {
    kanaOrKanji: string,
    kana: string
}

export const FuriganaJSX = ({ kanaOrKanji, kana }: FuriganaJSXProps): JSX.Element => {
    const furiganaList = getFuriganaObject(kanaOrKanji, kana);
    return <FuriganaJSXFromFuriganaObject furiganaList={furiganaList} />;
};

export const toastLayout: ToastLayout = {
    maxHeight: '3.5rem',
    width: '16rem',
    placement: 'bottomLeft',
};

export const addHideUIListener = (
    ipcBase: any,
    setUIShown: React.Dispatch<React.SetStateAction<boolean>>,
    removeAll: () => void,
    showToast: (text: string | ReactNode, delay: number) => void
) => {
    ipcRenderer.on(ipcBase.SET.HIDE_UI, () => {
        setUIShown((wasShown: boolean) => {
            if (!wasShown) {
                document.body.classList.remove('hide-border-markings');
                removeAll();
            } else {
                document.body.classList.add('hide-border-markings');
                showToast(<span>UI has been hidden. <br />Press H to bring it back.</span>, 1000);
            }

            return !wasShown;
        });
    });
};

export const mountLog = (scopedLog: Logger.LogFunctions, ...params: any[]) => {
    scopedLog.silly(...params);
};

export const addMountLogs = (scopedLog: Logger.LogFunctions) => {
    useEffect(() => {
        mountLog(scopedLog, '🔺 Mounted');
        return () => {
            mountLog(scopedLog, '🔻 Unmounted');
        };
    }, []);
};

export const setupEffect = (
    ipcBase: any,
    setUIShown: React.Dispatch<React.SetStateAction<boolean>>,
    removeAll: () => void,
    showToast: (text: string | ReactNode, delay: number) => void,
    scopedLog: Logger.LogFunctions,
    awaitedWindowIpcBase?: any,
    isAwaitedWindowReady?: boolean,
    setAwaitedWindowReady?: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    addMountLogs(scopedLog);

    useEffect(() => {
        ipcRenderer.send(ipcBase.ANNOUNCE.IS_READY);

        if (
            awaitedWindowIpcBase !== undefined &&
            isAwaitedWindowReady !== undefined &&
            setAwaitedWindowReady !== undefined
        ) {
            listenForAnotherWindowIsReady(
                awaitedWindowIpcBase,
                isAwaitedWindowReady,
                setAwaitedWindowReady
            );
        }

        addHideUIListener(
            ipcBase,
            setUIShown,
            removeAll,
            showToast
        );

        return () => {
            ipcRenderer.removeAllListeners(ipcBase.SET.HIDE_UI);

            if (
                awaitedWindowIpcBase !== undefined &&
                isAwaitedWindowReady !== undefined &&
                setAwaitedWindowReady !== undefined
            ) {
                ipcRenderer.removeAllListeners(awaitedWindowIpcBase.ANNOUNCE.IS_READY);
            }
        };
    }, []);
};

export const listenForAnotherWindowIsReady = (
    ipcBase: any,
    isReady: boolean,
    setReady: React.Dispatch<React.SetStateAction<boolean>>
): void => {
    // Case #1: Target window loaded before Awaited window
    ipcRenderer.on(ipcBase.ANNOUNCE.IS_READY, (event: any) => {
        setReady(true);
    });

    // Case #2: Awaited window loaded before Target window
    if (!isReady) {
        ipcRenderer.invoke(ipcBase.REQUEST.IS_READY)
            .then((result: boolean) => { setReady(result); })
            .catch((err: any) => { log.error(err); });
    }
};

const changeDOMLength = (
    DOMProperty: string,
    min: number,
    max: number,
    step: number,
    unit: string,
    windowName: string,
    storeProperty: string,
    conditionForIncrement: boolean
) => {
    // if conditionForIncrement true: then increment
    // if conditionForIncrement false: then decrement
    const root = document.querySelector(':root') as HTMLElement;

    const currentLength = +parseFloat(
        getComputedStyle(root)
            .getPropertyValue(DOMProperty)
            .slice(0, -unit.length)).toFixed(2);

    log.debug("current", currentLength)
    const newLength = currentLength + (conditionForIncrement ? 1 : -1) * step;
    log.debug("new", newLength)
    const finalLength = ((newLength < min || newLength > max) ? currentLength : newLength).toFixed(2) + unit;
    log.debug("final", finalLength)

    if (storeProperty) {
        windowStore.set(`${windowName}.${storeProperty}`, finalLength);
    }
    root.style.setProperty(
        DOMProperty,
        finalLength
    );
    return finalLength;
}

const changeDOMColor = (
    DOMProperty: string,
    windowName: string,
    storeProperty: string,
    color: string,
) => {
    const root = document.querySelector(':root') as HTMLElement;

    try {
        if (storeProperty) {
            windowStore.set(`${windowName}.${storeProperty}`, color);
        }
        root.style.setProperty(
            DOMProperty,
            color
        );
    } catch {
        throw new Error('Wrong color format');
    }
}




export const changeFontGlowColor = (windowName: string, color: string) => {
    changeDOMColor('--font-glow-color', windowName, 'additional.fontGlowColor', color)
};

export const changeFontColor = (windowName: string, color: string) => {
    changeDOMColor('--font-color', windowName, 'additional.fontColor', color)
};

export const changeFontSizeDOM = (windowName: string, conditionForZoomIn: boolean): string => {
    return changeDOMLength(
        '--font-size',
        6, 999, 1, "px",
        windowName, 'additional.fontSize',
        conditionForZoomIn
    )
};

export const changeBodyPaddingDOM = (windowName: string, conditionForZoomIn: boolean): string => {
    return changeDOMLength(
        '--body-padding',
        0, 10, 0.1, "rem",
        windowName, 'additional.bodyPadding',
        conditionForZoomIn
    )
};

export const changeFontGlowStrengthDOM = (windowName: string, conditionForIncrement: boolean): string => {
    return changeDOMLength(
        '--font-glow-strength',
        0, 0.25, 0.01, "em",
        windowName, 'additional.fontGlowStrength',
        conditionForIncrement
    )
}

export const changeBackgroundColorDOM = (windowName: string, color: string) => {
    changeDOMColor('--background-color', windowName, '', color);
};

const KEYBOARD_KEYS = {
    MINUS_KEY: 'Minus',
    PLUS_KEY: 'Equal',
    NUMPAD_ADD: 'NumpadAdd',
    NUMPAD_SUBTRACT: 'NumpadSubtract',
    KEY_H: 'KeyH',
};

export const initializeWindowListeners = (windowName: string, ipcBase: any) => {
    window.addEventListener('wheel', (event) => {
        if (event.ctrlKey) {
            changeFontSizeDOM(windowName, event.deltaY < 0);
        }
    }, { passive: false });

    window.addEventListener('keydown', (event) => {
        switch (event.code) {
            case KEYBOARD_KEYS.PLUS_KEY:
            case KEYBOARD_KEYS.NUMPAD_ADD:
                changeFontSizeDOM(windowName, true);
                break;
            case KEYBOARD_KEYS.MINUS_KEY:
            case KEYBOARD_KEYS.NUMPAD_SUBTRACT:
                changeFontSizeDOM(windowName, false);
                break;
            case KEYBOARD_KEYS.KEY_H:
                ipcRenderer.send(ipcBase.SET.HIDE_UI);
                break;
        }
    }, true);
};

const setRootPropertyIfExists = (DOMProperty: string, storeProperty: string, additionalCondition: boolean = true) => {
    const root = document.querySelector(':root') as HTMLElement;
    if (windowStore.has(storeProperty) && additionalCondition) {
        root.style.setProperty(
            DOMProperty,
            windowStore.get(storeProperty)
        );
    }
}

const numberRegexTest = (unit: string) => {
    return new RegExp('\^\\d+\\.\\d{2}' + unit + '\$')
}

export const initializeWindowSettingsFromStore = (windowName: string, ipcBase: any) => {
    setRootPropertyIfExists('--font-size', `${windowName}.additional.fontSize`,
        numberRegexTest('px').test(windowStore.get(`${windowName}.additional.fontSize`)))
    setRootPropertyIfExists('--font-glow-strength', `${windowName}.additional.fontGlowStrength`,
        numberRegexTest('em').test(windowStore.get(`${windowName}.additional.fontGlowStrength`)))
    setRootPropertyIfExists('--body-padding', `${windowName}.additional.bodyPadding`,
        numberRegexTest('rem').test(windowStore.get(`${windowName}.additional.bodyPadding`)))
    setRootPropertyIfExists('--font-color', `${windowName}.additional.fontColor`)
    setRootPropertyIfExists('--font-glow-color', `${windowName}.additional.fontGlowColor`)

};

export const initializeWindowSettings = (windowName: string, ipcBase: any) => {
    initializeWindowSettingsFromStore(windowName, ipcBase);
    initializeWindowListeners(windowName, ipcBase);
};

const NEW_STATUS = STATUS.NEW;
const KNOWN_STATUS = STATUS.KNOWN;
const SEEN_STATUS = STATUS.SEEN;
const IGNORED_STATUS = STATUS.IGNORED;

export const getWordStatusData = (dictionaryForm: string): string => {
    if (!dictionaryForm) return NEW_STATUS;

    const statusDataList = statusDataStore.get('status_data');

    let status = NEW_STATUS;
    if (statusDataList.known.includes(dictionaryForm)) status = KNOWN_STATUS;
    if (statusDataList.seen.includes(dictionaryForm)) status = SEEN_STATUS;
    if (statusDataList.ignored.includes(dictionaryForm)) status = IGNORED_STATUS;

    return status;
};

export const updateWordStatusStore = (dictionaryForm: string, desiredStatus: string) => {
    if (!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(dictionaryForm)) {
        return;
    }

    if (![SEEN_STATUS, KNOWN_STATUS, IGNORED_STATUS].includes(desiredStatus)) {
        throw new Error(`Status ${desiredStatus} is not defined.`);
    }

    // Get the store
    const statusDataList = statusDataStore.get('status_data');

    // Check what is the current status
    let prevStatus: string = NEW_STATUS;
    [SEEN_STATUS, KNOWN_STATUS, IGNORED_STATUS].forEach((status: string) => {
        if (statusDataList[`${status}`].includes(dictionaryForm)) {
            prevStatus = status; return;
        }
    });
    if (desiredStatus == prevStatus) return;

    // Filter out the word from all statuses
    [SEEN_STATUS, KNOWN_STATUS, IGNORED_STATUS].forEach((status: string) => {
        statusDataList[`${status}`] = statusDataList[`${status}`]
            .filter((elem: string) => elem !== dictionaryForm);
    });

    // Push the new status to the list
    statusDataList[`${desiredStatus}`].push(dictionaryForm);

    // Update the store
    statusDataStore.set('status_data', statusDataList);
    log.verbose(`Changed status of ${dictionaryForm} from ${prevStatus} to ${desiredStatus} in status data store`);
    ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, dictionaryForm, desiredStatus, prevStatus);
};