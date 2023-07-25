import { ElectronApplication } from 'playwright-core';
import { expect, test } from '@playwright/test';
import { ElectronAppInfo } from 'electron-playwright-helpers';
import { WindowInfo } from './types';
import { startApp } from './startApp';
import { assignWindow} from './utils';
import { organizeWebmFiles } from './organizeWebmFiles';

let appInfo: ElectronAppInfo;
let electronApp: ElectronApplication;
let allWindows: WindowInfo[];
let visibleWindows: WindowInfo[];

let clipboardWindow: WindowInfo;
let deepWindow: WindowInfo;
let ichiWindow: WindowInfo;
let readerWindow: WindowInfo;
let dictionaryWindow: WindowInfo;
let translationWindow: WindowInfo;
let settingsWindow: WindowInfo;

test.beforeAll(async () => {
  const StartAppResponse = await startApp();
  appInfo = StartAppResponse.appInfo;
  electronApp = StartAppResponse.app;
  allWindows = StartAppResponse.windows;

  clipboardWindow = assignWindow(allWindows, "clipboard")
  deepWindow = assignWindow(allWindows, "deep")
  ichiWindow = assignWindow(allWindows, "ichi")
  readerWindow = assignWindow(allWindows, "reader")
  dictionaryWindow = assignWindow(allWindows, "dictionary")
  translationWindow = assignWindow(allWindows, "translation")
  settingsWindow = assignWindow(allWindows, "settings")

  visibleWindows = [
    readerWindow, dictionaryWindow, translationWindow, settingsWindow
  ]
});

test.afterAll(async () => {
  await electronApp.close();
  await organizeWebmFiles()
});

const copyToClipboard = async (input: string) => {
  clipboardWindow.page.evaluate(`navigator.clipboard.writeText('${input}')`)
  const clipboardText = await clipboardWindow.page.evaluate(`navigator.clipboard.readText()`)
  expect(clipboardText).toBe(input)
}

const evaluateTooManyCharactersMessage = async () => {
  const paragraphLoc = translationWindow.page.locator('.deep-state-msg.too-many-characters')
  await paragraphLoc.waitFor({ timeout: 8000 });
  const paragraph = await paragraphLoc.evaluate((node: HTMLElement) => node.innerHTML)
  return paragraph
}

const evaluateParseMessage = async () => {
  const paragraphLoc = translationWindow.page.locator('.parse-notification-msg')
  await paragraphLoc.waitFor({ timeout: 8000 });
  const paragraph = await paragraphLoc.evaluate((node: HTMLElement) => node.innerHTML)
  return paragraph
}

const evaluateSentence = async () => {
  const sentenceLoc = translationWindow.page.locator('.japanese-sentence')
  await sentenceLoc.waitFor({ timeout: 8000 });
  const sentence = await sentenceLoc.evaluate((node: HTMLElement) => node.innerText)
  return sentence
}

const passableSentence = async (input: string, expectedOutput: string): Promise<void> => {
  await copyToClipboard(input)

  const paragraph = await evaluateParseMessage()
  expect(paragraph.includes("...")).toBe(true)

  const sentence = await evaluateSentence()
  expect(sentence).toBe(expectedOutput)
}

const nonPassableSentence = async (input: string): Promise<void> => {
  const sentence_before = await evaluateSentence()
  await copyToClipboard(input)
  const sentence_after = await evaluateSentence()

  expect(sentence_after).toBe(sentence_before)
}

const tooManyCharactersSentence = async (input: string): Promise<void> => {
  await copyToClipboard(input)
  const paragraph = await evaluateTooManyCharactersMessage()

  expect(paragraph.includes("Too many characters")).toBe(true)
}

const passableTest = (input: string, expectedOutput: string) => {
  test(`Expect "${input}" to display as "${expectedOutput}"`,
    async () => passableSentence(input, expectedOutput))
}

const nonPassableTest = (input: string) => {
  test(`Expect ${input} to not be parsed at all`,
    async () => nonPassableSentence(input))
}

const tooManyCharactersTest = (input: string) => {
  test(`Expect ${input} to have too many characters`,
    async () => tooManyCharactersSentence(input))
}

test.describe.configure({ mode: 'serial' });

test.describe('Copy text to clipboard and test translation', () => {
  test('Wait until connected to deepl.com', async () => {
    await translationWindow.page.locator('.deep-state-msg.connected').waitFor({ timeout: 8000 })
  })

  passableTest('食べました', '食べました')
  passableTest('昨日の大雨。', '昨日の大雨。')
  passableTest('e昨日の大雨。e e', 'e昨日の大雨。e e')
  passableTest('【記録型ＤＶＤ会議】', '【記録型ＤＶＤ会議】')

  passableTest( // 89 characters
    'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
    'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ')
  tooManyCharactersTest( // 90 characters
    'ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ')

  passableTest( // 89 characters
    '   aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaあ   ',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaあ')
  tooManyCharactersTest( // 90 characters
    '   aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaあ   ')

  passableTest('人aabb', '人aabb')
  passableTest('人a ', '人a')
  passableTest('韓㐎 / 한글', '韓㐎 / 한글')

  passableTest('二', '二')
  passableTest('ニ', 'ニ')
  passableTest('ﾀﾍﾞﾏｼﾀ', 'ﾀﾍﾞﾏｼﾀ')
  passableTest('2.ﾀﾍﾞﾏｼﾀ ', '２.ﾀﾍﾞﾏｼﾀ')
  passableTest(
    '１つの犬。２つの犬。３つの犬。４つの犬。５つの犬。６つの犬。７つの犬。８つの犬。９つの犬。１０つの犬。０つの犬。',
    '１つの犬。２つの犬。３つの犬。４つの犬。５つの犬。６つの犬。７つの犬。８つの犬。９つの犬。１０つの犬。０つの犬。')

  passableTest(' 10万', '１０万')
  passableTest(' 500万', '５００万')
  passableTest(' ５０1万 ', '５０１万')
  passableTest(' ５０一万 ', '５０一万')
  passableTest(' 5零１万 ', '５零１万')
  passableTest(' 五十', '五十')
  passableTest('２匹', '２匹')



  passableTest('わ ゐゑ を', 'わ ゐゑ を')
  passableTest('ゝ゚', 'ゝ゚')
  passableTest('∲∵⋅⋓aえ　', '∲∵⋅⋓aえ')

  nonPassableTest('∲∵⋅⋓a')
  nonPassableTest('   ')
  nonPassableTest('゛')
  nonPassableTest('  	｡ 	｢ 	｣ 	､ 	･')
  nonPassableTest('word')
  nonPassableTest('/parsing/')
  nonPassableTest('')
  nonPassableTest('한글')
  nonPassableTest('２')
  nonPassableTest('２ss. ')
  nonPassableTest('2')
  nonPassableTest(' a2x')
})