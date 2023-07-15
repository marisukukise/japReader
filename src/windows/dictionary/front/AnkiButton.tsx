
import { Button } from '@geist-ui/core';
import { getSettingsStore, getStatusDataStore } from '@globals/ts/main/initializeStore';
import { FuriganaJSX } from '@globals/ts/renderer/helpers';
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import log_renderer from 'electron-log/renderer';
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
import { useAtomValue } from 'jotai';
import { definitionsAtom, translatedSentenceAtom, infinitiveAtom, infinitiveKanaAtom, japaneseSentenceAtom, wordAtom, wordKanaAtom } from './Dictionary';
const log = log_renderer.scope('dictionary/AnkiButton');

const statusDataStore = getStatusDataStore();
const settingsStore = getSettingsStore();

const {
    ankiDeckName, ankiModelName,
    ankiInfinitive, ankiInfinitiveKana, ankiInfinitiveFurigana,
    ankiWord, ankiWordKana, ankiWordFurigana,
    ankiJapaneseSentence, ankiDefinitions, ankiEnglishSentence } = settingsStore.get('global_settings')

const _anki_PopulateFieldsIfNonEmpty = (fieldsObj: any, key: string, value: any) => {
    if (key) {
        fieldsObj[key] = value;
    }
}

const _anki_GuiEditNote = async (noteId: number) => {
    return ipcRenderer.invoke(IPC_CHANNELS.MAIN.REQUEST.ANKI_CONNECT, 'guiEditNote', {
        note: noteId
    });
}

const _anki_AddNote = async (
    wordData: Omit<japReader.IchiParsedWordData, "status"> & { japaneseSentence: string, translatedSentence: string }
) => {
    const fields = {};
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiInfinitive}`, wordData.infinitive);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiInfinitiveKana}`, wordData.infinitiveKana);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWord}`, wordData.word);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordKana}`, wordData.wordKana);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiDefinitions}`, wordData.definitions);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiJapaneseSentence}`, wordData.japaneseSentence);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiEnglishSentence}`, wordData.translatedSentence);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiInfinitiveFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kanaOrKanji={wordData.infinitive} kana={wordData.infinitiveKana} />));
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kanaOrKanji={wordData.word} kana={wordData.wordKana} />));

    return ipcRenderer.invoke(IPC_CHANNELS.MAIN.REQUEST.ANKI_CONNECT, 'addNote', {
        note: {
            deckName: `${ankiDeckName}`,
            modelName: `${ankiModelName}`,
            fields: fields,
            options: {
                allowDuplicate: false,
                duplicateScope: "deck",
                duplicateScopeOptions: {
                    deckName: `${ankiDeckName}`,
                    checkChildren: false,
                    checkAllModels: false
                }
            },
            tags: ["japReader"],
        }
    });
}

const _anki_CanAddNotes = (infinitive: string) => {
    const fields: any = {};
    fields[`${ankiInfinitive}`] = infinitive;
    return ipcRenderer.invoke(IPC_CHANNELS.MAIN.REQUEST.ANKI_CONNECT, 'canAddNotes', {
        notes: [{
            deckName: `${ankiDeckName}`,
            modelName: `${ankiModelName}`,
            fields: fields
        }]
    })
}

export const AnkiButton = () => {
    const word = useAtomValue(wordAtom);
    const wordKana = useAtomValue(wordKanaAtom);
    const infinitive = useAtomValue(infinitiveAtom);
    const infinitiveKana = useAtomValue(infinitiveKanaAtom);
    const definitions = useAtomValue(definitionsAtom);
    const japaneseSentence = useAtomValue(japaneseSentenceAtom);
    const translatedSentence = useAtomValue(translatedSentenceAtom);

    const [canAddWord, setCanAddWord] = useState(false);
    const [noteId, setNoteId] = useState(0)
    const [disabled, setDisabled] = useState(false);
    const [buttonText, setButtonText] = useState('Loading...')


    log.debug("word", word)
    log.debug("wordKana", wordKana)
    log.debug("infinitive", infinitive)
    log.debug("infinitiveKana", infinitiveKana)
    log.debug("definitions", definitions)
    log.debug("japaneseSentence", japaneseSentence)
    log.debug("translatedSentence", translatedSentence)

    const addWordToAnki = () => {
        setDisabled(true);
        _anki_AddNote({
            word: word,
            wordKana: wordKana,
            infinitive: infinitive,
            infinitiveKana: infinitiveKana,
            definitions: definitions,
            japaneseSentence: japaneseSentence,
            translatedSentence: translatedSentence
        }).then((result: any) => {
            log.debug("Add Note result:", result)
            setNoteId(result);
            setDisabled(false);
            setCanAddWord(false);
        }).catch((err: any) => {
            setDisabled(false);
            log.error(err)
        })
    }

    useEffect(() => {
        setButtonText("Loading...")
        setDisabled(true);
        _anki_CanAddNotes(word)
            .then((result: boolean[]) => {
                console.debug("Can Add Notes result:",result)
                setCanAddWord(result[0]);
                setDisabled(false);
            })
            .catch((error: any) => {
                log.error(error)
                setDisabled(false);
            })
    }, [infinitive])

    useEffect(() => {
        setButtonText(canAddWord ? "Add to Anki" : "Preview in Anki")
    }, [canAddWord])

    const guiEditNote = () => {
        console.log(noteId)
        setDisabled(true);
        _anki_GuiEditNote(noteId)
            .then((result: any) => {
                log.debug("Preview Note result:", result)
                setDisabled(false);
            })
            .catch((err: any) => {
                setDisabled(false);
                log.error(err)
            })
    }

    return <Button disabled={disabled} onClick={canAddWord ? addWordToAnki : guiEditNote}>
        {buttonText}
    </Button>
}