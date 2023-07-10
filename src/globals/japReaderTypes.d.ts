declare namespace japReader {
    interface IchiParsedWordData {
        word: string;
        dictForm: string;
        dictFormReading: string;
        rubyReading: string;
        definitions: string;
    }

    interface ExtendedWordData extends IchiParsedWordData {
        status: string;
    }

    interface ConfigurationDrawerSetting {
        [key: string]: JSX.Element
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