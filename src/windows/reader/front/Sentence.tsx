import { FuriganaJSX, updateWordStatusStore } from '@globals/ts/renderer/helpers';
import { ipcRenderer } from 'electron';
import { useEffect, useRef, useState } from 'react';
import { Text } from '@geist-ui/core';

import { IPC_CHANNELS, STATUS } from '@globals/ts/main/objects';

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
    const [wordOriginal, setWordOriginal] = useState(wordData.word);
    const [wordOriginalReading, setWordOriginalReading] = useState(wordData.rubyReading);
    const [wordDict, setWordDict] = useState(wordData.dictForm);
    const [definitions, setDefinitions] = useState(wordData.definitions);
    const [status, setStatus] = useState(wordData.status);

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (event, dictionaryForm, newStatus, prevStatus) => {
            if (wordDict == dictionaryForm) {
                setStatus(newStatus);
            }
        });
        return () => {
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
        };
    }, []);

    const handleMouseDown = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>): boolean => {
        // Only continue when pressed main or secondary button
        if (![MOUSE_BUTTONS.MAIN, MOUSE_BUTTONS.SECONDARY].includes(event.button))
            return;

        let nextWordStatus = status;

        switch (event.button) {
        // Left mouse button
        case MOUSE_BUTTONS.MAIN:
            // + CTRL
            if (event.ctrlKey)
                nextWordStatus = STATUS.IGNORED;

            else if (status == STATUS.NEW)
                nextWordStatus = STATUS.SEEN;

            break;

            // Right mouse button
        case MOUSE_BUTTONS.SECONDARY:
            nextWordStatus = STATUS.KNOWN;
            break;
        }

        setStatus(nextWordStatus);

        // Send messages to dictionary
        console.log(wordData);
        ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.PARSED_WORDS_DATA, wordData);
        ipcRenderer.send(IPC_CHANNELS.DICTIONARY.SET.SHOW);

        if (wordDict)
            updateWordStatusStore(wordDict, nextWordStatus);

        return true;
    };


    return definitions
        ? <span
            onMouseDown={(event) => handleMouseDown(event)}
            className={status + ' word'}>
            <FuriganaJSX kanaOrKanji={wordOriginal} kana={wordOriginalReading} />
        </span>
        : <span className='junk'>{wordOriginal}</span>;
};

const getUniqueWordLength = (words: japReader.IchiParsedWordData[], status: string) => {
    return [... new Set(words
        .filter(e => e.status === status)
        .map(e => e.dictForm))].length;
};

type SentenceProps = {
    words: japReader.IchiParsedWordData[]
}
export const Sentence = ({ words }: SentenceProps): JSX.Element => {
    const uniqueNewWordsCount = useRef(getUniqueWordLength(words, STATUS.NEW));
    const uniqueSeenWordsCount = useRef(getUniqueWordLength(words, STATUS.SEEN));
    const [isPlusOneSentence, setPlusOneSentence] = useState((uniqueNewWordsCount.current + uniqueSeenWordsCount.current) == 1);

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (event, dictionaryForm, newStatus, prevStatus) => {
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
        {words.map((wordData: japReader.IchiParsedWordData, index: number) =>
            <Word key={index} wordData={wordData} />
        )}
    </Text>);
};