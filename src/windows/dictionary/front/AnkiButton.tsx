
import { Button } from '@geist-ui/core';
import { getSettingsStore, getStatusDataStore } from '@globals/ts/main/initializeStore';
import { FuriganaJSX } from '@globals/ts/renderer/helpers';
import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const statusDataStore = getStatusDataStore();
const settingsStore = getSettingsStore();

const {
    useDeep, ankiIntegration, ankiDeckName, ankiModelName,
    ankiDictForm, ankiDictFormReading, ankiDictFormFurigana,
    ankiWord, ankiWordReading, ankiWordFurigana,
    ankiJapanese, ankiDefinitions, ankiEnglish } = settingsStore.get('global_settings')

function invoke(action: any, version: any, params: any = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('AnkiConnect: Failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'AnkiConnect: Response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'AnkiConnect: Response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'AnkiConnect: Response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://localhost:8765');
        xhr.send(JSON.stringify({ action, version, params }));
    });
}
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
        renderToStaticMarkup(<FuriganaJSX kana={wordData.dictForm} kanaOrKanji={wordData.dictFormReading} />));
    _anki_PopulateFieldsIfNonEmpty(fields, `${ankiWordFurigana}`,
        renderToStaticMarkup(<FuriganaJSX kana={wordData.word} kanaOrKanji={wordData.rubyReading} />));
    const res: any = await invoke('addNote', 6, {
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
    return res;
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
        })
    }

    return <Button disabled={disabled} onClick={addWordToAnki}>
        {buttonText}
    </Button>
}