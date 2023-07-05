import { Sentence } from "@src/windows/reader/front/Sentence"

export const TranslatedSentence = (
    { translatedSentence, japaneseSentence }: {
        translatedSentence: string,
        japaneseSentence: string
    }
): JSX.Element => {
    return <>
    <div className='translatedSentence'>{translatedSentence}</div>
    <div className='japaneseSentence'>{japaneseSentence}</div>
    </>
}