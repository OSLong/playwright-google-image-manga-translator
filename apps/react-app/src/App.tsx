import React from 'react';
import { AppProvider, useAppContext } from './provider/AppProvider';

function App() {
  const appContext = useAppContext()
  console.log("Image List Now ", appContext.isInitializing)


  if (appContext.isInitializing && !appContext.imageUrlList){
    return <h1>
      Init ...
    </h1>
  }
  const stopWatching = () => {
    appContext.stopWatching?.()
  }

  const isNotWatched = !appContext.watchConfig 
  if ( isNotWatched){
    const directoryChoose = async (event: any) => {
      const dir = await appContext?.startWatching?.("")
    }

 
    return (
      <h1>
        Watching Config ...
        <button onClick={directoryChoose} >Open Directory</button>
        {/* <input type="file" onChange={directoryChoose} {...directoryProps} /> */}
      </h1>
    )
  }

  return (
      <div className="App">
        <h4 style={{ position: 'fixed' , top: 0, right: 0}}>Watch on : { appContext.watchConfig?.path } 
          <button onClick={stopWatching}>Stop </button>
        </h4> 
        <div style={{ overflowY: 'scroll' , marginTop: 75 }}>
          {appContext.imageUrlList?.map((imageUrl: string, index: number) => {
            
            return (
              <img className='manga-image' src={imageUrl} key={index}  />
            )
          })}
        </div>
      </div>
  );
}

export default App;
