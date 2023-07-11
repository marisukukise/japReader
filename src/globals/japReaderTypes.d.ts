declare namespace japReader {
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