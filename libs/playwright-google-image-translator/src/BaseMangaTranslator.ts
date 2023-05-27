import {  Browser, Page } from 'playwright'
 
type TranslateResult = string | undefined

export abstract class BaseMangaTranslator {
    constructor(private browser: Browser){}

    page!: Page

    async init(): Promise<void> {
        this.page = await this.browser.newPage()
    }

    async translateBinary(image: Blob) : Promise<TranslateResult> {
        throw new Error('Not Implement')
    }

    async translatePath(inputPath: string, outputDir: string) :  Promise<TranslateResult>{
        throw new Error('Not Implement')
    }

    async close() {}


    async reload() {
        await this.page.reload()
    }
}