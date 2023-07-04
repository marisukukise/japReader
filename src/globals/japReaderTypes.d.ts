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


    
    interface ConfigurationDrawerSettingContents {
        label: string;
        icon: JSX.Element;
        fn: () => void;
    }

    interface ConfigurationDrawerSetting {
        [key: string]: ConfigurationDrawerSettingContents
    }

    interface FuriganaObject {
        w: string;
        r: string;
    }

}