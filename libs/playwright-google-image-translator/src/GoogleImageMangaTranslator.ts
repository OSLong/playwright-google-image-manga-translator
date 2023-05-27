import { BaseMangaTranslator } from "./BaseMangaTranslator"
// import {  } from "playwright"
import path from 'path'

export class GoogleImageMangaTranslator extends BaseMangaTranslator {
    async init(): Promise<void> {
        await super.init()
        await this.page.goto('https://translate.google.com/?sl=ja&tl=zh-CN&op=images', { waitUntil: 'domcontentloaded'})
    }

    async translatePath(inputPath: string, outputDir: string): Promise<string> {
        const closeButton = await this.page.$('button[aria-label="Clear image"]')
        if ( closeButton){
            await closeButton.click()
        }

        const filename = inputPath.split('/').slice(-1).toString()
        const inputFileLocation = await this.page.getByText('Choose an image')
                .locator('..')
                .locator('input[type="file"]')

        await inputFileLocation.setInputFiles([ inputPath ])


        // const result = await this.page.getByRole('img')..all()
        const result = await this.page.$$('img[loading="lazy"]' )
        // await result.waitFor({ state: "attached"})    
        // await result[1].waitForElementState('visible')

        await this.page.waitForResponse(/blob.*/g,{ timeout: 60000 })

        await this.page.waitForTimeout(3000)

        const downloadPromise = this.page.waitForEvent('download')

        const downloadButton = await this.page.locator('div[data-is-touch-wrapper="true"] button[aria-label="Download translation"]')
        await downloadButton.click()

        const download = await downloadPromise
      
        const outputPath = path.join(outputDir, filename)
        await download.saveAs(outputPath)
      
        return outputPath  
    }
}