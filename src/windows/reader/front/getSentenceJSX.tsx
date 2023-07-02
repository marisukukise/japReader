const { fit } = require("furigana");
import { getStatusDataStore } from "@globals/ts/initializeStore";
const statusDataStore = getStatusDataStore();
import log from 'electron-log/renderer';

type FuriganaObject = {
  w: string,
  r: string,
}

type ParsedWordData = {
  word: string,
  dictForm: string,
  dictFormReading: string,
  rubyReading: string,
  definitions: string,
}


const getFuriganaData = (w: string, r: string): FuriganaObject[] => {
  try {
    return fit(w, r, { type: 'object' });
  } catch (err) {
    // return anyway if the word is a digit
    if (/^[０１２３４５６７８９]+$/.test(w))
      return [{ w: w, r: r }]
  }
}

const getFuriganaJSX = (furiganaList: FuriganaObject[]): JSX.Element => {
  return (<>{
    furiganaList.map((furiganaEntry: FuriganaObject) => 
      <>
        {furiganaEntry.w.match(/\p{Script=Han}/u) ?
          <ruby>{furiganaEntry.w}<rp>（</rp><rt>{furiganaEntry.r}</rt><rp>）</rp></ruby> :
          <>{furiganaEntry.w}</>
        }
      </>
    )
  }</>)
}

const parseWord = (word: ParsedWordData): JSX.Element => {
  const furiganaWordData = getFuriganaData(word.word, word.rubyReading)
  const furiganaDictData = (word.word == word.dictForm) ?
    furiganaWordData : getFuriganaData(word.dictForm, word.dictFormReading)


  return (<>
    {getFuriganaJSX(furiganaWordData)}
  </>)
}

export const getSentenceJSX = (words: ParsedWordData[]): JSX.Element => {
  return (<>
    {words.map((word: ParsedWordData, index: number) => 
      <span className="word" key={index}>
        {parseWord(word)}
      </span>
    )}
  </>)
}