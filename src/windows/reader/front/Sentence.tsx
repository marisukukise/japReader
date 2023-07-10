import { FuriganaJSX, updateWordStatusStore , getWordStatusData } from "@globals/ts/renderer/helpers";
import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { Text } from '@geist-ui/core'

import { IPC_CHANNELS, WORD_DATA_STATUSES } from "@globals/ts/main/objects";

const MOUSE_BUTTONS = {
  'MAIN': 0, // Usually left button
  'SECONDARY': 2, // Usually right button
  'MIDDLE': 1, // Middle button
  'FOURTH': 3, // Typically the 'browser back' button
  'FIFTH': 4, // Typically the 'browser forward' button
}

type WordProps = {
  wordData: japReader.IchiParsedWordData
}
const Word = ({ wordData }: WordProps): JSX.Element => {
  const [wordStatus, setWordStatus] = useState(getWordStatusData(wordData.dictForm))

  useEffect(() => {
    ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (event, dictionaryForm, newStatus, prevStatus) => {
      if (wordData.dictForm == dictionaryForm) {
        setWordStatus(newStatus)
      }
    });
    return () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
    }
  }, [])

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
        console.log("unknown mouse code")

    }

    setWordStatus(nextWordStatus);

    // Create word data object for ditionary
    const extendedWordData: japReader.ExtendedWordData = {
      ...wordData,
      status: nextWordStatus
    }

    // Send messages to dictionary
    console.log(extendedWordData)
    ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA, extendedWordData);
    ipcRenderer.send(IPC_CHANNELS.DICTIONARY.SET.SHOW);

    if(wordData.dictForm)
      updateWordStatusStore(wordData.dictForm, nextWordStatus)

    return true;
  }

  
  return wordData.definitions
    ? <span
      onMouseDown={(event) => handleMouseDown(event)}
      className={wordStatus + " word"}>
      <FuriganaJSX kanaOrKanji={wordData.word} kana={wordData.rubyReading} />
    </span>
    : <span className='junk'>{wordData.word}</span>
}

type SentenceProps = {
  words: japReader.IchiParsedWordData[]
}
export const Sentence = ({ words }: SentenceProps): JSX.Element => {
  // TODO: Detect Words with the same dictionary form in the Sentence (for example detect whether the sentence is i+1)

  return (<Text p className='sentence'>
    {words.map((wordData: japReader.IchiParsedWordData, index: number) =>
      <Word key={index} wordData={wordData} />
    )}
  </Text>)
}