
import { Button } from '@geist-ui/core';
import { getSettingsStore } from '@root/src/globals/ts/initializers/initializeStore';
import { FuriganaJSX } from '@root/src/globals/ts/helpers/rendererHelpers';
import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import log_renderer from 'electron-log/renderer';
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';
import { useAtomValue } from 'jotai';
import { definitionsAtom, translatedSentenceAtom, infinitiveAtom, infinitiveKanaAtom, japaneseSentenceAtom, wordAtom, wordKanaAtom } from './Dictionary';
const log = log_renderer.scope('dictionary/AnkiButton');

const settingsStore = getSettingsStore();

const {
    ankiDeckName, ankiModelName,
    ankiInfinitive, ankiInfinitiveKana, ankiInfinitiveFurigana,
    ankiWord, ankiWordKana, ankiWordFurigana,
    ankiJapaneseSentence, ankiDefinitions, ankiTranslatedSentence } = settingsStore.get('global_settings');

const _anki_PopulateFieldsIfNonEmpty = (fieldsObj: any, key: string, value: any) => {
    if (key) {
        fieldsObj[key] = value;
    }
};

const _anki_GuiEditNote = async (noteId: number) => {
    return ipcRenderer.invoke(IPC_CHANNELS.ANKI_CONNECT.INVOKE, 'guiEditNote', {
        note: noteId
    });
};

const _anki_AddNote = async (
    wordData: Omit<japReader.IchiParsedWordData, 'status'> & { japaneseSentence: string, translatedSentence: string }
) => {
    console.log('jp', wordData.japaneseSentence);
    console.log('en', wordData.translatedSentence);
    console.log('jp fl', ankiJapaneseSentence);
    console.log('en fl', ankiTranslatedSentence);
    const fields = {};
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiInfinitive}`, wordData.infinitive);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiInfinitiveKana}`, wordData.infinitiveKana);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWord}`, wordData.word);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordKana}`, wordData.wordKana);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiDefinitions}`, wordData.definitions);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiJapaneseSentence}`, wordData.japaneseSentence);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiTranslatedSentence}`, wordData.translatedSentence);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiInfinitiveFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kanaOrKanji={wordData.infinitive} kana={wordData.infinitiveKana} />));
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kanaOrKanji={wordData.word} kana={wordData.wordKana} />));

    return ipcRenderer.invoke(IPC_CHANNELS.ANKI_CONNECT.INVOKE, 'addNote', {
        note: {
            deckName: `${ankiDeckName}`,
            modelName: `${ankiModelName}`,
            fields: fields,
            options: {
                allowDuplicate: false,
                duplicateScope: 'deck',
                duplicateScopeOptions: {
                    deckName: `${ankiDeckName}`,
                    checkChildren: false,
                    checkAllModels: false
                }
            },
            tags: ['japReader'],
        }
    });
};

const _anki_FindNotes = async (query: string): Promise<any> => {
    return ipcRenderer.invoke(IPC_CHANNELS.ANKI_CONNECT.INVOKE, 'findNotes', {
        query: query
    });
};

const _anki_GetNoteIdFromInfinitive = async (infinitive: string): Promise<number> => {
    return _anki_FindNotes(`deck:${ankiDeckName} ${ankiInfinitive}:${infinitive}`)
        .then((result: number[]) => {
            if (result.length == 0) return 0;
            if (result.length > 1)
                throw `There should only be 1 word ${infinitive} in ${ankiDeckName} but detected ${result.length}.`;
            return result[0]!;
        });
};

const BUTTON_MESSAGES = {
    'ADD': 'Add to Anki',
    'PREVIEW': 'Preview in Anki',
    'ERROR': 'AnkiConnect Error',
    'LOADING': 'Loading...'
};

export const AnkiButton = () => {
    const word = useAtomValue(wordAtom);
    const wordKana = useAtomValue(wordKanaAtom);
    const infinitive = useAtomValue(infinitiveAtom);
    const infinitiveKana = useAtomValue(infinitiveKanaAtom);
    const definitions = useAtomValue(definitionsAtom);
    const japaneseSentence = useAtomValue(japaneseSentenceAtom);
    const translatedSentence = useAtomValue(translatedSentenceAtom);

    const canAddWord = useRef(false);
    const noteId = useRef(0);
    const [disabled, setDisabled] = useState(false);
    const [buttonText, setButtonText] = useState(BUTTON_MESSAGES.LOADING);


    /* @BEGIN Callback functions */

    const error_Callback = (error: any) => {
        setButtonText(BUTTON_MESSAGES.ERROR);
        log.warn(error);
    };

    const success_AddedToAnkiCallback = (addedNoteId: number) => {
        noteId.current = addedNoteId;
        canAddWord.current = false;
        setLoading(false, BUTTON_MESSAGES.PREVIEW);
    };

    const error_AddedToAnkiCallback = (error: any) => {
        error_Callback(error);
    };

    const success_PreviewedNoteGUICallback = (_result: any) => {
        setLoading(false, BUTTON_MESSAGES.PREVIEW);
    };

    const error_PreviewedNoteGUICallback = (error: any) => {
        error_Callback(error);
    };

    /* @END Callback functions */


    const setLoading = (state: boolean, buttonText = '') => {
        setDisabled(state);
        setButtonText(state ? BUTTON_MESSAGES.LOADING : buttonText);
    };

    useEffect(() => {
        canAddWord.current = false;
        setLoading(true);
        _anki_GetNoteIdFromInfinitive(infinitive)
            .then((result: number) => {
                noteId.current = result;
                canAddWord.current = noteId.current === 0;
                setLoading(false, canAddWord.current ? BUTTON_MESSAGES.ADD : BUTTON_MESSAGES.PREVIEW);
            })
            .catch((error: any) => {
                error_Callback(error);
            });
    }, [infinitive]);

    const addWordToAnki = () => {
        console.log(translatedSentence);
        setLoading(true);
        _anki_AddNote({
            word: word,
            wordKana: wordKana,
            infinitive: infinitive,
            infinitiveKana: infinitiveKana,
            definitions: definitions,
            japaneseSentence: japaneseSentence,
            translatedSentence: translatedSentence
        }).then((result: number) => {
            success_AddedToAnkiCallback(result);
        }).catch((error: any) => {
            error_AddedToAnkiCallback(error);
        });
    };

    const guiEditNote = () => {
        setLoading(true);
        if (noteId.current === 0) return;
        _anki_GuiEditNote(noteId.current)
            .then((result: any) => {
                success_PreviewedNoteGUICallback(result);
            })
            .catch((error: any) => {
                error_PreviewedNoteGUICallback(error);
            });
    };

    return <Button  disabled={disabled} loading={buttonText == BUTTON_MESSAGES.LOADING}
        onClick={canAddWord.current ? addWordToAnki : guiEditNote}
    >{buttonText}</Button>;
};