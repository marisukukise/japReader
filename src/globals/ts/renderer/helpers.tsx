import { ipcRenderer } from "electron";
import React from "react";
import log from 'electron-log/renderer';
import { getStatusDataStore } from "@globals/ts/main/initializeStore";
const statusDataStore = getStatusDataStore();
import { getWindowStore } from "@globals/ts/main/initializeStore";
const windowStore = getWindowStore();
const { fit } = require("furigana");
import { IPC_CHANNELS, WORD_DATA_STATUSES } from "@globals/ts/main/objects";

const getFuriganaObject = (w: string, r: string): japReader.FuriganaObject[] => {
  try {
    return fit(w, r, { type: 'object' });
  } catch (err) {
    // return anyway if the word is a digit
    if (/^[０１２３４５６７８９]+$/.test(w))
      return [{ w: w, r: r }]
  }
}

type FuriganaJSXFromFuriganaObjectProps = {
  furiganaList: japReader.FuriganaObject[]
}
const FuriganaJSXFromFuriganaObject = ({ furiganaList }: FuriganaJSXFromFuriganaObjectProps): JSX.Element => {
  return (<>{
    furiganaList.map((furiganaEntry: japReader.FuriganaObject, index: number) =>
      <ruby key={index}>
        {
          furiganaEntry.w.match(/\p{Script=Han}/u) ?
            <>{furiganaEntry.w}<rp>（</rp><rt>{furiganaEntry.r}</rt><rp>）</rp></> :
            <>{furiganaEntry.w}</>
        }
      </ruby>
    )
  }</>)
}

type FuriganaJSXProps = {
  kanaOrKanji: string,
  kana: string
}

export const FuriganaJSX = ({ kanaOrKanji, kana }: FuriganaJSXProps): JSX.Element => {
  const furiganaList = getFuriganaObject(kanaOrKanji, kana)
  return <FuriganaJSXFromFuriganaObject furiganaList={furiganaList} />
}

export const listenForAnotherWindowIsReady = (
  windowIpcCollection: any,
  isReady: boolean,
  setReady: React.Dispatch<React.SetStateAction<boolean>>
): void => {


  // Case #1: Target window loaded before Awaited window
  ipcRenderer.on(windowIpcCollection.ANNOUNCE.IS_READY, (event: any) => {
    setReady(true);
  })

  // Case #2: Awaited window loaded before Target window
  if (!isReady) {
    ipcRenderer.invoke(windowIpcCollection.REQUEST.IS_READY)
      .then((result: boolean) => { setReady(result); })
      .catch((error: any) => { log.log(error) });
  }
}

export const changeFontColor = (windowName: string, color: string) => {
  const root = document.querySelector(':root') as HTMLElement;
  const fontColorRootProperty = '--primary-font';
  try {
    windowStore.set(`${windowName}.backgroundColor`, color);
    root.style.setProperty(
      fontColorRootProperty,
      color
    );
  } catch {
    throw new Error("Wrong color format")
  }
}

export const zoom = (windowName: string, conditionForZoomIn: boolean) => {
  // if conditionForZoomIn true:  then zoom in
  // if conditionForZoomIn false: then zoom out
  const root = document.querySelector(':root') as HTMLElement;
  const fontSizeRootPropertry = '--main-font-size';
  const minFontSize = 6;

  const currentFontSize = parseInt(
    getComputedStyle(root)
      .getPropertyValue(fontSizeRootPropertry)
      .slice(0, -2)
  );
  const newFontSize = (currentFontSize + (conditionForZoomIn ? 1 : (currentFontSize > minFontSize ? -1 : 0))).toString() + "px"
  root.style.setProperty(
    fontSizeRootPropertry,
    newFontSize
  );
    windowStore.set(`${windowName}.fontSize`, newFontSize);
}

export const fontSizeEventListener = (windowName: string) => {
  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) zoom(windowName, event.deltaY < 0)
  }, { passive: false })

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && (event.key == '=' || event.key == '+'))
      zoom(windowName, true)
    if (event.ctrlKey && (event.key == '-'))
      zoom(windowName, false)
  }, { passive: false })
}

export const initializeWindowSettingsFromStore = (windowName: string) => {
  const root = document.querySelector(':root') as HTMLElement;
  const fontSizeRootPropertry = '--main-font-size';
  const fontColorRootProperty = '--primary-font';
  if (windowStore.has(`${windowName}.fontSize`) && /^\d+px$/.test(windowStore.get(`${windowName}.fontSize`))) {
    root.style.setProperty(
      fontSizeRootPropertry,
      windowStore.get(`${windowName}.fontSize`)
    );
  }
  if (windowStore.has(`${windowName}.fontColor`)) {
    root.style.setProperty(
      fontColorRootProperty,
      windowStore.get(`${windowName}.fontColor`)
    );
  }

}

const newStatus = WORD_DATA_STATUSES.NEW
const knownStatus = WORD_DATA_STATUSES.KNOWN
const seenStatus = WORD_DATA_STATUSES.SEEN
const ignoredStatus = WORD_DATA_STATUSES.IGNORED

export const getWordStatusData = (dictionaryForm: string): string => {
  const statusDataList = statusDataStore.get("status_data");

  let status = newStatus
  if (statusDataList.known.includes(dictionaryForm)) status = knownStatus
  if (statusDataList.seen.includes(dictionaryForm)) status = seenStatus
  if (statusDataList.ignored.includes(dictionaryForm)) status = ignoredStatus

  return status;
}

export const updateWordStatusStore = (dictionaryForm: string, desiredStatus: string) => {
  if (!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|…/u.test(dictionaryForm)) {
    return;
  }

  if (![seenStatus, knownStatus, ignoredStatus].includes(desiredStatus)) {
    throw new Error(`Status ${desiredStatus} is not defined.`)
  }

  // Get the store
  const statusDataList = statusDataStore.get("status_data");

  // Filter out the word from all statuses
  [seenStatus, knownStatus, ignoredStatus].forEach((status: string) => {
    statusDataList[`${status}`] = statusDataList[`${status}`]
      .filter((elem: string) => elem !== dictionaryForm)
  })

  // Push the new status to the list
  statusDataList[`${desiredStatus}`].push(dictionaryForm)

  // Update the store
  statusDataStore.set('status_data', statusDataList)
  log.log(`Changed status of ${dictionaryForm} to ${desiredStatus} in status data store`)
  ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, dictionaryForm, desiredStatus)
}