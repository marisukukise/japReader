
import log_renderer from 'electron-log/renderer';
import { createScopedLog } from '@globals/ts/main/setupLogging';
const log = createScopedLog(log_renderer, 'settings');

import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';
import { Button, Checkbox, Input, useToasts } from '@geist-ui/core';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
import { ReactNode, useEffect, useState } from 'react';
import { addHideUIListener, toastLayout } from '@globals/ts/renderer/helpers';
import { ipcRenderer } from 'electron';




// TODO: Add transparent/opaque option to each window
// TODO: Make settings work (to save to store and on launch)
// TODO: Add error checking option

export const Settings = () => {
    const [isUIShown, setUIShown] = useState(true);
    const { setToast, removeAll } = useToasts(toastLayout);

    const showToast = (text: string | ReactNode, delay: number) => setToast({
        text: text, delay: delay
    });

    useEffect(() => {
        addHideUIListener(IPC_CHANNELS.SETTINGS, setUIShown, removeAll, showToast);

        return () => {
            ipcRenderer.removeAllListeners(IPC_CHANNELS.SETTINGS.SET.HIDE_UI);
        };
    }, []);

    const settings = <>
        <ConfigurationDrawerCommonSettings
            windowName="settings"
            ipcBase={IPC_CHANNELS.SETTINGS}
        />
    </>;

    const classes = ['settings-wrapper'];

    return (<>
        {isUIShown && <DraggableBar />}
        <div
            className={classes.join(' ')}
        >
            <h1>Options Menu</h1>
            <h3>Hover on the option for more information.</h3>
            <h3>Press Apply down below to save options.</h3>
            <h3>The program will be restarted. All your progress will be saved.</h3>
        </div>
        <div id="all-options">
            <fieldset id="deep">
                <legend>Translation</legend>
                <Checkbox>Use DeepL translation window</Checkbox>
                <Checkbox>Use DeepL API</Checkbox>
                <Input placeholder="DeepL API Key" />
            </fieldset>
            <fieldset id="reader">
                <legend>Reader</legend>
                <Checkbox>Use Reader window</Checkbox>
            </fieldset>
            <fieldset id="anki">
                <legend>Anki</legend>
                <Checkbox>Use Anki integration</Checkbox>
            </fieldset>
        </div>
        <div id="buttons">
            <section id="apply">
                <Button>Apply</Button>
            </section>
            <section id="danger-zone">
                <summary>Big red buttons</summary>
                <div id="red-buttons">
                    <Button>Reset window settings</Button>
                    <Button>Reset status data</Button>
                    <Button>Reset global settings</Button>
                    <Button>Reset history logs</Button>
                    <Button>Reset EVERYTHING</Button>
                </div>
            </section>
        </div>
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />}
    </>);
};