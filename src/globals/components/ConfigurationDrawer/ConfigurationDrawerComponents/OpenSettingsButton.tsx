import { Button } from '@geist-ui/core';
import Settings from '@geist-ui/icons/settings';
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';
import { ipcRenderer } from 'electron';

export const OpenSettingsButton = () => {
    const openSettingsWindow = () => {
        ipcRenderer.send(IPC_CHANNELS.SETTINGS.SET.SHOW);
    };
    return <Button icon={<Settings />} onClick={openSettingsWindow} auto>
        Open global Settings
    </Button>;
};