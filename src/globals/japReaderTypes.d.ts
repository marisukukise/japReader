declare namespace japReader {
    interface GlobalSettingsStore {
        useDeepL: boolean;
        useDeepLApi: boolean;
        deepLApiKey: string;
        useReader: boolean;
        ankiIntegration: boolean;
        ankiDeckName: string;
        ankiModelName: string;
        ankiInfinitive: string;
        ankiInfinitiveKana: string;
        ankiInfinitiveFurigana: string;
        ankiWord: string;
        ankiWordKana: string;
        ankiWordFurigana: string;
        ankiDefinitions: string;
        ankiJapaneseSentence: string;
        ankiEnglishSentence: string;
    }
    interface StatusDataStore {
        seen: string[];
        known: string[];
        ignored: string[];
    }
    interface IchiParsedWordData {
        word: string;
        wordKana: string;
        infinitive: string;
        infinitiveKana: string;
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