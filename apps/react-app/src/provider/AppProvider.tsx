import React, { useContext, useEffect, useState } from 'react'
import {EVENT_START_WATCH_PAYLOAD } from '@playwright-manga-translator/electron-app/src/global'


type ContextValues = {
    imageUrlList?: string[]
    isInitializing?: boolean,
    watchConfig?: EVENT_START_WATCH_PAYLOAD | undefined,
    startWatching?: (path: string) => void,
    stopWatching?: () => void
} 

const context = React.createContext<ContextValues>({})

export const AppProvider = (props: React.PropsWithChildren) => {

    const [imageList, setImageList] = useState<string[]>([])
    const [initializing, setInitializing] = useState<boolean>(true)
    const [ watchConfig, setWatchConfig ] = useState<EVENT_START_WATCH_PAYLOAD | undefined >(undefined)

    useEffect(() => {
        window.electron_ipc.onImageAdded((event: any, payload: any) => {
            console.log("Image Aded : ", payload)

            setImageList((old) => {
                console.log("set list ",old)
                return [
                    ...old,
                    payload
                ]
            })
        })

        window.electron_ipc.onInitializing(() => {
            setInitializing(false)
            window.electron_ipc.offInitializing()
        })

        return () => {
            window.electron_ipc.offImageAdded()
        }
    }, [])

    const startWatching = async (path: string) => {
        const config = {
            path
        }
        const dir = await window.electron_ipc.startWatchOnPath(config)
        console.log("Reuslt From Dir ", dir)
        const newConfig = {
            path: dir
        }
        setWatchConfig(newConfig)
    }

    const stopWatching = () => {
        window.electron_ipc.stopWatching()
        setWatchConfig(undefined)
        setImageList([])
    }

    const contextValues: ContextValues = {
        imageUrlList: imageList,
        isInitializing: initializing,
        watchConfig,
        startWatching,
        stopWatching
    }

    return (
        <context.Provider value={contextValues}>
            {props.children}
        </context.Provider>
    )
}

export const useAppContext = () => React.useContext(context)