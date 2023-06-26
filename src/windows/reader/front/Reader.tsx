import { ipcRenderer } from "electron";

export const Reader = () => {
    ipcRenderer.send("log", "Hello from Reader");
    return (
        <h1>Welcome from the Reader window</h1>
    )
}