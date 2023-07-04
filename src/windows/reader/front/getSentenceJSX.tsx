import { getStatusDataStore } from "@globals/ts/main/initializeStore";
const statusDataStore = getStatusDataStore();
import { FuriganaJSX } from "@globals/ts/renderer/helpers";
import { ipcRenderer } from "electron";
import log from 'electron-log/renderer';
import { useState } from "react";

const MOUSE_BUTTONS = {
  'MAIN': 0, // Usually left button
  'SECONDARY': 2, // Usually right button
  'MIDDLE': 1, // Middle button
  'FOURTH': 3, // Typically the 'browser back' button
  'FIFTH': 4, // Typically the 'browser forward' button
}

const WORD_DATA_STATUSES = {
  NEW: "new",
  SEEN: "seen",
  KNOWN: "known",
  IGNORED: "ignored",
}

const getWordStatusData = (dictionaryForm: string): string => {
  const statusDataList = statusDataStore.get("status_data");

  let status = WORD_DATA_STATUSES.NEW
  if (statusDataList.known.includes(dictionaryForm)) status = WORD_DATA_STATUSES.KNOWN
  if (statusDataList.seen.includes(dictionaryForm)) status = WORD_DATA_STATUSES.SEEN
  if (statusDataList.ignored.includes(dictionaryForm)) status = WORD_DATA_STATUSES.IGNORED

  return status;
}

type WordProps = {
  wordData: japReader.IchiParsedWordData
}
const Word = ({ wordData }: WordProps): JSX.Element => {
  const [wordStatus, setWordStatus] = useState(getWordStatusData(wordData.dictForm))

  const handleMouseDown = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>): boolean => {
    // Only continue when pressed main or secondary button
    if (![MOUSE_BUTTONS.MAIN, MOUSE_BUTTONS.SECONDARY].includes(event.button))
      return;

    let nextWordStatus = wordStatus;

    switch (event.button) {

      // Left mouse button
      case MOUSE_BUTTONS.MAIN:
        // + CTRL
        if (event.ctrlKey)
          nextWordStatus = WORD_DATA_STATUSES.IGNORED;

        else if (wordStatus == WORD_DATA_STATUSES.NEW)
          nextWordStatus = WORD_DATA_STATUSES.SEEN;

        break;

      // Right mouse button
      case MOUSE_BUTTONS.SECONDARY:
        nextWordStatus = WORD_DATA_STATUSES.KNOWN;
        break;

      default:
        console.log("unknown code")

    }

    setWordStatus(nextWordStatus);

    // Create word data object for ditionary
    const extendedWordData: japReader.ExtendedWordData = {
      ...wordData,
      status: nextWordStatus
    }


    // Get the store
    const statusDataList = statusDataStore.get("status_data");

    console.table([wordStatus, nextWordStatus, wordData.dictForm])

    // Filter out the old status from the list if the state is not "new"
    if ([WORD_DATA_STATUSES.SEEN, WORD_DATA_STATUSES.KNOWN, WORD_DATA_STATUSES.IGNORED].includes(wordStatus))
      statusDataList[`${wordStatus}`] = statusDataList[`${wordStatus}`]
        .filter((elem: string) => elem !== wordData.dictForm)

    // Push the new status to the list
    statusDataList[`${nextWordStatus}`].push(wordData.dictForm)

    // Update the store
    statusDataStore.set('status_data', statusDataList)

    // Send messages to dictionary
    ipcRenderer.send('sendWordData', extendedWordData);
    ipcRenderer.send('openDict');

    return true;
  }

  return wordData.definitions
    ? <span
      onMouseDown={(event) => handleMouseDown(event)}
      className={wordStatus || 'word'}>
      <FuriganaJSX kanaOrKanji={wordData.word} kana={wordData.rubyReading} />
    </span>
    : <span className='junk'>{wordData.word}</span>
}

type SentenceProps = {
  words: japReader.IchiParsedWordData[]
}
export const Sentence = ({ words }: SentenceProps): JSX.Element => {
  return (<div className='sentence'>
    {words.map((wordData: japReader.IchiParsedWordData, index: number) =>
      <Word key={index} wordData={wordData} />
    )}
  </div>)
}