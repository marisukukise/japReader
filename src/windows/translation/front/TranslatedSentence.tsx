import { Text } from '@geist-ui/core';

export const TranslatedSentence = (
    { translatedSentence, japaneseSentence }: {
        translatedSentence: string,
        japaneseSentence: string
    }
): JSX.Element => {
    return <>
        <Text p className='translated-sentence'>{translatedSentence}</Text>
        <Text p className='japanese-sentence'>{japaneseSentence}</Text>
    </>;
};