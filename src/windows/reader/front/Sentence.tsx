import { FuriganaJSX, setIgnoreMouseEvents, updateWordStatusStore } from '@root/src/globals/ts/helpers/rendererHelpers';
import { ipcRenderer } from 'electron';
import { useEffect, useRef, useState } from 'react';
import { Text } from '@geist-ui/core';

import { IPC_CHANNELS, STATUS } from '@root/src/globals/ts/other/objects';
import { useAtomValue } from 'jotai';
import { isUIShownAtom, japaneseSentenceAtom, translatedSentenceAtom, wordListAtom } from './Reader';

const MOUSE_BUTTONS = {
    'MAIN': 0, // Usually left button
    'SECONDARY': 2, // Usually right button
    'MIDDLE': 1, // Middle button
    'FOURTH': 3, // Typically the 'browser back' button
    'FIFTH': 4, // Typically the 'browser forward' button
};

type WordProps = {
    wordData: japReader.IchiParsedWordData
}
const Word = ({ wordData }: WordProps): JSX.Element => {
    const japaneseSentence = useAtomValue(japaneseSentenceAtom);
    const translatedSentence = useAtomValue(translatedSentenceAtom);
    const [word,] = useState(wordData.word);
    const [wordKana,] = useState(wordData.wordKana);
    const [infinitive,] = useState(wordData.infinitive);
    const [definitions,] = useState(wordData.definitions);
    const [status, setStatus] = useState(wordData.status);
    const isUIShown = useAtomValue(isUIShownAtom);

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (_event, dictionaryForm, newStatus, _prevStatus) => {
            if (infinitive == dictionaryForm) {
                setStatus(newStatus);
            }
        });
        return () => {
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
        };
    }, []);

    /**
     * Handle mousedown event for primary (0) and secondary (2) mouse buttons 
     * (refer to https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)
     * 
     * On primary press change word status to seen
     * 
     * On primary press + Ctrl press change word status to ignored
     * 
     * On secondary press change word status to known
     * 
     * @param event
     * @returns True if function finished successfully 
     */
    const handleMouseDown = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>): boolean => {
        // Only continue when pressed main or secondary button
        if (![MOUSE_BUTTONS.MAIN, MOUSE_BUTTONS.SECONDARY].includes(event.button))
            return false;

        let nextWordStatus = status;

        switch (event.button) {
        // Primary mouse button
        case MOUSE_BUTTONS.MAIN:
            // + CTRL
            if (event.ctrlKey)
                nextWordStatus = STATUS.IGNORED;

            else if (status == STATUS.NEW)
                nextWordStatus = STATUS.SEEN;

            break;

            // Secondary mouse button
        case MOUSE_BUTTONS.SECONDARY:
            nextWordStatus = STATUS.KNOWN;
            break;
        }

        setStatus(nextWordStatus);

        // Send messages to dictionary
        ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.PARSED_WORDS_DATA, {
            ...wordData,
            japaneseSentence: japaneseSentence,
            translatedSentence: translatedSentence
        });
        ipcRenderer.send(IPC_CHANNELS.DICTIONARY.SET.SHOW);

        if (infinitive)
            updateWordStatusStore(infinitive, nextWordStatus);

        return true;
    };


    return definitions
        ? <span
            onMouseEnter={() => setIgnoreMouseEvents(false, isUIShown)}
            onMouseLeave={() => setIgnoreMouseEvents(true, isUIShown)}
            onMouseDown={(event) => handleMouseDown(event)}
            className={status + ' word'}>
            <FuriganaJSX kanaOrKanji={word} kana={wordKana} />
        </span>
        : <span className='junk'>{word}</span>;
};

const getUniqueWordLength = (words: japReader.IchiParsedWordData[], status: string) => {
    return [... new Set(words
        .filter(e => e.status === status)
        .map(e => e.infinitive))].length;
};


export const Sentence = (): JSX.Element => {
    const wordList = useAtomValue(wordListAtom);
    const uniqueNewWordsCount = useRef(getUniqueWordLength(wordList, STATUS.NEW));
    const uniqueSeenWordsCount = useRef(getUniqueWordLength(wordList, STATUS.SEEN));
    const [isPlusOneSentence, setPlusOneSentence] = useState((uniqueNewWordsCount.current + uniqueSeenWordsCount.current) == 1);

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (_event, _dictionaryForm, newStatus, prevStatus) => {
            if (newStatus == STATUS.NEW)
                uniqueNewWordsCount.current += 1;
            if (newStatus == STATUS.SEEN)
                uniqueSeenWordsCount.current += 1;
            if (prevStatus == STATUS.NEW)
                uniqueNewWordsCount.current -= 1;
            if (prevStatus == STATUS.SEEN)
                uniqueSeenWordsCount.current -= 1;
            console.log(uniqueNewWordsCount, uniqueSeenWordsCount);
            setPlusOneSentence((uniqueNewWordsCount.current + uniqueSeenWordsCount.current) == 1);
            console.log(isPlusOneSentence);
        });
        return () => {
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
        };
    }, []);

    const classes = ['sentence-wrapper']
        .concat(isPlusOneSentence ? 'plus-one-sentence' : []);

    return (<Text p className={classes.join(' ')}>
        {wordList.map((wordData: japReader.IchiParsedWordData, index: number) =>
            <Word key={index} wordData={wordData} />
        )}
    </Text>);
};