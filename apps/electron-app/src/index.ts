import electron, { IpcMainEvent, app, ipcMain } from 'electron'
import path from 'path'
import url from 'url'
import { EVENT,  } from './constants'
import Chokidar from 'chokidar'
import { EVENT_START_WATCH_PAYLOAD } from './global'
import isImage from 'is-image'
// import {} from 
import playwright from 'playwright-extra'
import { BaseMangaTranslator, GoogleImageMangaTranslator } from '@playwright-manga-translator/lib-image-translator'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { BehaviorSubject, concatMap, delay } from 'rxjs'
import { Browser } from 'playwright'
import os from 'os'

let playwrightGooglePage: BaseMangaTranslator
let playwrightBrowser: Browser
let window!: electron.BrowserWindow 
// StealthPlugin
playwright.chromium.use( StealthPlugin())

const imageAddedSubject = new BehaviorSubject<string>('')

let continueTranslate = false

async function setup() {
    const browser = await playwright.chromium.launch({ headless: true})
    const google = new GoogleImageMangaTranslator(browser)
    await google.init()

    playwrightGooglePage = google
    playwrightBrowser = browser

    const tmpdir = os.tmpdir()
    imageAddedSubject.asObservable().pipe(
        delay(1000),
        concatMap(async (inputPath) => {
            if ( !continueTranslate ){
                return ''
            }
            if (!inputPath){
                return ''
            }

            const randomstring = (Math.random() + 1).toString(36).substring(7);

            const outputDir = path.join( tmpdir , randomstring)
            let result =""
            try {
                result = await google.translatePath(inputPath, outputDir)
                console.log("Image Translating : ", result)

            } catch(error) {
                console.log("Error is ",error)
                await google.reload()
            }
        console.log("Result : ",result)

            return result
        })

    ).subscribe((outputPath) => {
        if ( !outputPath ){
            return ''
        }
        console.log("View result Path is ", outputPath)
        const resultPathUrl = url.format({
            pathname: outputPath,
            slashes: true,
            protocol: 'file'
        })
        window.webContents.send(EVENT.EVENT_SHOW_IMAGE, resultPathUrl)
    })

    let watch!: Chokidar.FSWatcher
    

    electron.ipcMain.on(EVENT.EVENT_START_WATCH_ON, async (event: IpcMainEvent,  ) => {
        continueTranslate = true
        const dialog = electron.dialog
        console.log("Run ClickOpen ")
        const dir = await dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
            defaultPath: "~"
        });
        if (!dir) {
            return 
        }

        const directoryPath =  dir.filePaths.toString()
        watch = Chokidar.watch( directoryPath, {
            depth: 1
        })
        watch.on('add', (path) => {
            if(!isImage(path)){
                return 
            }
            console.log("Image Added : ", path)
            const urlpath = path
            imageAddedSubject.next(urlpath)
        } )

        event.returnValue = directoryPath 


    })

    electron.ipcMain.on(EVENT.EVENT_STOP_WATCH, async  () => {
        continueTranslate = false
        await watch.close()
    })


    window.webContents.send(EVENT.EVENT_INITIALIZING)
}

app.whenReady().then(async () => {
    console.log("preload : ",path.join(__dirname, '../preload/preload.js'))
    window = new electron.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false,
            preload: path.join(__dirname, 'preload/preload.js')
        }
    })

    const publicUrl = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(__dirname, '../public/index.html')
    })
    window.loadURL(process.env.ELECTRON_START_URL || publicUrl)
    // window.webContents.toggleDevTools()
    window.show()

    window.on('ready-to-show', async () => {
        await setup()
    })
})

app.on('window-all-closed', async () => {
    await imageAddedSubject.unsubscribe()

    await playwrightGooglePage.close()
    
    await playwrightBrowser.close()

    app.quit()
})