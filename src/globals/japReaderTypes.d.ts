declare namespace japReader {
    interface GlobalSettingsStore {
        useDeepL: boolean;
        useDeepLApi: boolean;
        deepLApiKey: string;
        useReader: boolean;
        ankiIntegration: boolean;
        ankiDeckName: string;
        ankiModelName: string;
        ankiDictForm: string;
        ankiDictFormReading: string;
        ankiDictFormFurigana: string;
        ankiWord: string;
        ankiWordReading: string;
        ankiWordFurigana: string;
        ankiDefinitions: string;
        ankiJapanese: string;
        ankiEnglish: string;
    }
    interface StatusDataStore {
        seen: string[];
        known: string[];
        ignored: string[];
    }
    interface IchiParsedWordData {
        word: string;
        dictForm: string;
        dictFormReading: string;
        rubyReading: string;
        definitions: string;
        status: string;
    }

    interface FuriganaObject {
        w: string;
        r: string;
    }
}


// modules allowing for importing image files
declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.ico';
declare module '*.jp2';
declare module '*.webp';