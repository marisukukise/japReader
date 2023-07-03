import { ipcRenderer } from "electron";
import { useEffect } from "react";

export const Settings = () => {
    
    useEffect(()=>{
        ipcRenderer.send("announce/settings/isReady")
    },[])

    return (
        <h1>Welcome from the Settings window</h1>
    )
}