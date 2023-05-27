import electron, { IpcMessageEvent,  ipcRenderer } from 'electron'
import { EVENT } from '../constants'
import { IpcRendererEvent } from 'electron/renderer'
import { CallbackFunction, EVENT_START_WATCH_PAYLOAD } from '../global'


const ElectronExposeIpc = Object.freeze({
    onImageAdded: (callback: CallbackFunction) => ipcRenderer.on(EVENT.EVENT_SHOW_IMAGE, callback) ,

    offImageAdded: () => ipcRenderer.removeAllListeners(EVENT.EVENT_SHOW_IMAGE),

    onInitializing: (callback: CallbackFunction) => ipcRenderer.on(EVENT.EVENT_INITIALIZING, callback),

    offInitializing: () => ipcRenderer.removeAllListeners(EVENT.EVENT_INITIALIZING),

    startWatchOnPath: (payload: EVENT_START_WATCH_PAYLOAD) => ipcRenderer.sendSync(EVENT.EVENT_START_WATCH_ON, payload),

    stopWatching: () => ipcRenderer.send(EVENT.EVENT_STOP_WATCH)
})

export const ElectronExposeIPCType =  ElectronExposeIpc

electron.contextBridge.exposeInMainWorld('electron_ipc', ElectronExposeIpc)

