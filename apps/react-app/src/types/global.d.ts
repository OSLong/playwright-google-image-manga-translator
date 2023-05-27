import { ElectronExposeIPCType } from '@playwright-manga-translator/electron-app/build/preload/preload'

declare global {
    interface Window {
        declare  electron_ipc:  ElectronExposeIPCType
    }
}

