import { Text } from '@geist-ui/core';

export const TranslatedSentence = (
    { translatedSentence, japaneseSentence }: {
        translatedSentence: string,
        japaneseSentence: string
    }
): JSX.Element => {
    return <>
        <Text p className='translatedSentence'>{translatedSentence}</Text>
        <Text p className='japaneseSentence'>{japaneseSentence}</Text>
    </>;
};