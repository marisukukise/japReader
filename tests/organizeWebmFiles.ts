import { mkdir, readdir, access, constants, rename } from 'fs/promises'
import * as path from 'path';


const WEBM_DIR = path.join(process.cwd(), 'test-results', 'webm')

const getDirectories = async source =>
    (await readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

const getWebmFiles = async source =>
    (await readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isFile() && dirent.name.endsWith(".webm"))
        .map(dirent => dirent.name)

const createDirAndMoveWebmFilesThere = async (webmFiles: string[], subdir: string) => {
    try {
        await mkdir(path.join(WEBM_DIR, subdir))
        for (const file in webmFiles) {
            await rename(path.join(WEBM_DIR, webmFiles[file]), path.join(WEBM_DIR, subdir, file+".webm"))
        }
    } catch (error) {
        console.error(error)
    }
}

/**
 * The function creates a new dir in the test-results/webm dir
 * with the name +1 more than the biggest dir (converted to numbers)
 * and copies all .webm files from the parent directory to there
 */
export const organizeWebmFiles = async () => {
    try {
        await access(WEBM_DIR, constants.R_OK | constants.W_OK);
    } catch {
        return
    }

    try {
        const files = await getWebmFiles(WEBM_DIR)
        if (files.length === 0) return

        const directories = await getDirectories(WEBM_DIR)

        if (directories.length === 0) {
            await createDirAndMoveWebmFilesThere(files, "1")
            return
        }

        const newDirectoryName = (Math.max(...directories.map(dir => Number(dir))) + 1).toString()
        await createDirAndMoveWebmFilesThere(files, newDirectoryName)

        return
    }
    catch (error) {
        console.error(error)
    }
}