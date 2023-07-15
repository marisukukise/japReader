
import { Button } from '@geist-ui/core';
import { getSettingsStore, getStatusDataStore } from '@globals/ts/main/initializeStore';
import { FuriganaJSX } from '@globals/ts/renderer/helpers';
import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import log_renderer from 'electron-log/renderer';
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
const log = log_renderer.scope('dictionary/AnkiButton');

const statusDataStore = getStatusDataStore();
const settingsStore = getSettingsStore();

const {
    useDeep, ankiIntegration, ankiDeckName, ankiModelName,
    ankiDictForm, ankiDictFormReading, ankiDictFormFurigana,
    ankiWord, ankiWordReading, ankiWordFurigana,
    ankiJapanese, ankiDefinitions, ankiEnglish } = settingsStore.get('global_settings')

const _anki_PopulateFieldsIfNonEmpty = (fieldsObj: any, key: string, value: any) => {
    if (key) {
        fieldsObj[key] = value;
    }
}

const _anki_AddNote = async (wordData: japReader.IchiParsedWordData) => {
    const fields = {};
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiDictForm}`, wordData.dictForm);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiDictFormReading}`, wordData.dictFormReading);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWord}`, wordData.word);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordReading}`, wordData.rubyReading);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiDefinitions}`, wordData.definitions);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiJapanese}`, wordData.japaneseSentence);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiEnglish}`, wordData.englishSentence);
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiDictFormFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kanaOrKanji={wordData.dictForm} kana={wordData.dictFormReading} />));
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kanaOrKanji={wordData.word} kana={wordData.rubyReading} />));

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

export const AnkiButton = ({ word, dictForm, dictFormReading, rubyReading, definitions, status, japaneseSentence, englishSentence }: japReader.IchiParsedWordData) => {
    const [disabled, setDisabled] = useState(false);
    const [buttonText, setButtonText] = useState('Add to Anki')

    const addWordToAnki = () => {
        setDisabled(true);
        _anki_AddNote({
            word: word,
            dictForm: dictForm,
            dictFormReading: dictFormReading,
            rubyReading: rubyReading,
            definitions: definitions,
            status: status,
            japaneseSentence: japaneseSentence,
            englishSentence: englishSentence
        }).then(() => {
            setDisabled(false);
            setButtonText('Preview the card');
        }).catch((err: any) => {
            log.error(err)
        })
    }

    return <Button disabled={disabled} onClick={addWordToAnki}>
        {buttonText}
    </Button>
}