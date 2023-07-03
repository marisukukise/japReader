const { fit } = require("furigana");

const getFuriganaObject = (w: string, r: string): japReader.FuriganaObject[] => {
  try {
    return fit(w, r, { type: 'object' });
  } catch (err) {
    // return anyway if the word is a digit
    if (/^[０１２３４５６７８９]+$/.test(w))
      return [{ w: w, r: r }]
  }
}

type FuriganaJSXFromFuriganaObjectProps = {
  furiganaList: japReader.FuriganaObject[]
}
const FuriganaJSXFromFuriganaObject = ({furiganaList}: FuriganaJSXFromFuriganaObjectProps): JSX.Element => {
  return (<>{
    furiganaList.map((furiganaEntry: japReader.FuriganaObject, index: number) =>
      <ruby key={index}>
        {
          furiganaEntry.w.match(/\p{Script=Han}/u) ?
            <>{furiganaEntry.w}<rp>（</rp><rt>{furiganaEntry.r}</rt><rp>）</rp></> :
            <>{furiganaEntry.w}</>
        }
      </ruby>
    )
  }</>)
}

type FuriganaJSXProps = {
  kanaOrKanji: string,
  kana: string
}
export const FuriganaJSX = ({kanaOrKanji, kana}: FuriganaJSXProps): JSX.Element => {
  const furiganaList = getFuriganaObject(kanaOrKanji, kana)
  return <FuriganaJSXFromFuriganaObject furiganaList={furiganaList}/>
}