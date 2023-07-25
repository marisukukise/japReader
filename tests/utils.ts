import { WindowInfo } from "./types";

export async function pause(ms: number) {
  return new Promise(f => setTimeout(f, ms));
}

export const assignWindow = (allWindows: WindowInfo[], windowName: string): WindowInfo => {
  if (allWindows.filter(e => e.name === windowName).length !== 1) {
    throw new Error(`There are more than 1 windows with name ${windowName}`)
  } else {
    return allWindows.filter(e => e.name === windowName)[0]
  }
}

