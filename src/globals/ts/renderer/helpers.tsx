import { ipcRenderer } from "electron";
import React from "react";
import log from 'electron-log/renderer';

const { fit } = require("furigana");

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
  awaitedWindowName: string,
  isReady: boolean,
  setReady: React.Dispatch<React.SetStateAction<boolean>>
): void => {

  // Case #1: Target window loaded before Awaited window
  ipcRenderer.on(`announce/${awaitedWindowName}/isReady`, (event: any) => {
    setReady(true);
  })

  // Case #2: Awaited window loaded before Target window
  if (!isReady) {
    ipcRenderer.invoke(`get/${awaitedWindowName}/isReady`)
      .then((result: boolean) => { setReady(result); })
      .catch((error: any) => { log.log(error) });
  }
}

export const removeListenerForAnotherWindow = (
  awaitedWindowName: string,
): void => {
  ipcRenderer.removeAllListeners(`announce/${awaitedWindowName}/isReady`);
}