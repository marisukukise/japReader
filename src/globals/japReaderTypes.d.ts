declare namespace japReader {
    interface IchiParsedWordData {
        word: string;
        dictForm: string;
        dictFormReading: string;
        rubyReading: string;
        definitions: string;
    };

    interface ExtendedWordData extends IchiParsedWordData {
        status: string;
    }


    interface ConfigurationDrawerSetting {
        key: string;
        label: string;
        icon: JSX.Element;
        fn: () => void;
    }

    interface FuriganaObject {
        w: string;
        r: string;
    }

}