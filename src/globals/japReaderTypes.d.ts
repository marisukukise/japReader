declare namespace japReader {
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

    interface Windows {
        clipboard: BrowserWindow;
        settings: BrowserWindow;
        ichi?: BrowserWindow;
        reader?: BrowserWindow;
        dictionary?: BrowserWindow;
        deep?: BrowserWindow;
        translation?: BrowserWindow;
    }

    interface FontInfo {
        "filename": string;
        "filepath": string;
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