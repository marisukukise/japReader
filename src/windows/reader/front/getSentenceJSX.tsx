import { getStatusDataStore } from "@globals/ts/main/initializeStore";
const statusDataStore = getStatusDataStore();
import { FuriganaJSX } from "@globals/ts/renderer/helpers";
import { ipcRenderer } from "electron";
import log from 'electron-log/renderer';
import { FC, useEffect, useState } from "react";

const MOUSE_BUTTONS = {
  'MAIN_BUTTON': 0, // Usually left button
  'SECONDARY_BUTTON': 2, // Usually right button
  'MIDDLE_BUTTON': 1, // Middle button
  'FOURTH_BUTTON': 3, // Typically the 'browser back' button
  'FIFTH_BUTTON': 4, // Typically the 'browser forward' button
}

const getWordStatusData = (dictionaryForm: string): string => {
  const statusDataList = statusDataStore.get("status_data");

  let status = "new"
  if (statusDataList.known.includes(dictionaryForm)) status = "known"
  if (statusDataList.seen.includes(dictionaryForm)) status = "seen"
  if (statusDataList.ignored.includes(dictionaryForm)) status = "ignored"

  return status;
}

type WordProps = {
  wordData: japReader.IchiParsedWordData
}
const Word = ({ wordData }: WordProps): JSX.Element => {
  const [wordStatus, setWordStatus] = useState(getWordStatusData(wordData.dictForm))
  const wordFuriganaJSX = <FuriganaJSX kanaOrKanji={wordData.word} kana={wordData.rubyReading} />

  const handleMouseDown = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>): boolean => {
    console.log(event.button, event.buttons)
    switch (event.button) {
      case MOUSE_BUTTONS.MAIN_BUTTON:
        if (event.ctrlKey) // + Ctrl 
          setWordStatus('ignored');
        else if (wordStatus == 'new')
          setWordStatus('seen');
        break;
      case MOUSE_BUTTONS.SECONDARY_BUTTON:
        setWordStatus('known');
        break;
    }
    const extendedWordData: japReader.ExtendedWordData = {
      ...wordData,
      status: wordStatus
    }
    ipcRenderer.send('sendWordData', extendedWordData);
    ipcRenderer.send('openDict');

    return true;
  }


  if (!wordData.definitions)
    return <span className="junk">{wordData.word}</span>


  return (
    <span
      onMouseDown={(event) => handleMouseDown(event)}
      className={wordStatus || 'word'}>

      {wordFuriganaJSX}

    </span>)
}

type SentenceProps = {
  words: japReader.IchiParsedWordData[]
}
export const Sentence = ({ words }: SentenceProps): JSX.Element => {
  return (<div className="sentence">
    {words.map((wordData: japReader.IchiParsedWordData, index: number) =>
      <Word key={index} wordData={wordData} />
    )}
  </div>)
}