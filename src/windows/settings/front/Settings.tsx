
import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('settings');

import { getSettingsStore, getHistoryStore, getStatusDataStore, getWindowStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const historyStore = getHistoryStore();
const statusDataStore = getStatusDataStore();
const windowStore = getWindowStore();

import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';
import { Button, Checkbox, Input, useToasts } from '@geist-ui/core';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
import { ReactNode, useEffect, useState } from 'react';
import { addHideUIListener, setupEffect, toastLayout } from '@globals/ts/renderer/helpers';
import { ipcRenderer } from 'electron';




// TODO: Add transparent/opaque option to each window
// TODO: Make settings work (to save to store and on launch)
// TODO: Add error checking option

export const Settings = () => {
    const [isUIShown, setUIShown] = useState(true);
    const [formData, setFormData] = useState(settingsStore.get('global_settings'));
    const { setToast, removeAll } = useToasts(toastLayout);

    const showToast = (text: string | ReactNode, delay: number) => setToast({
        text: text, delay: delay
    });

    const resetWindowStore = () => {
        windowStore.clear();
    };

    const resetStatusDataStore = () => {
        statusDataStore.clear();
    };

    const resetSettingsStore = () => {
        settingsStore.clear();
    };

    const resetHistoryStore = () => {
        historyStore.clear();
    };

    const resetAllStores = () => {
        resetWindowStore();
        resetStatusDataStore();
        resetSettingsStore();
        resetHistoryStore();
    };

    const handleSettingsChange = (event: any) => {
        const { name, value } = event.target;
        setFormData((prevFormData: any) => ({ ...prevFormData, [name]: value }));
    };


    const applySettings = () => {
        log.debug('applied!', formData);
    };

    const bringConfirmationDialog = (message: string, callback: () => void) => {
        ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.REQUEST.SHOW_DIALOG, message)
            .then((result: any) => {
                if (result.response === 0) {
                    callback();
                    ipcRenderer.send(IPC_CHANNELS.MAIN.HANDLE.RESTART_PROGRAM);
                }
            });
    };

    setupEffect(
        IPC_CHANNELS.SETTINGS,
        setUIShown,
        removeAll,
        showToast,
        log
    );

    useEffect(() => {

        return () => {

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
            <form onSubmit={
                () => {
                    bringConfirmationDialog(
                        'Are you sure you want to apply settings?\nThis will restart japReader.',
                        applySettings
                    );
                }}>
                <fieldset id="deep">
                    <legend>Translation</legend>
                    <Checkbox checked={formData.useDeepL} onChange={handleSettingsChange}>
                        Use DeepL translation window
                    </Checkbox>
                    <Checkbox checked={formData.useDeepLApi} onChange={handleSettingsChange}>
                        Use DeepL API
                    </Checkbox>
                    <Input placeholder="DeepL API Key" value={formData.deepLApiKey} />
                </fieldset>
                <fieldset id="reader">
                    <legend>Reader</legend>
                    <Checkbox checked={formData.useReader} onChange={handleSettingsChange}>
                        Use Reader window
                    </Checkbox>
                </fieldset>
                <fieldset id="anki">
                    <legend>Anki</legend>
                    <Checkbox checked={formData.ankiIntegration} onChange={handleSettingsChange}>
                        Enable Anki integration
                    </Checkbox>
                </fieldset>
                <section id="apply">
                    <Button htmlType='submit'>Apply</Button>
                </section>
            </form>
        </div>
        <div id="danger-zone">
            <summary>Big red buttons</summary>
            <div id="red-buttons">
                <Button onClick={
                    () => {
                        bringConfirmationDialog(
                            'Are you sure you want to reset window settings?\nThis will delete all settings like font sizes, window positions etc.',
                            resetWindowStore
                        );
                    }}>Reset window settings</Button>
                <Button onClick={
                    () => {
                        bringConfirmationDialog(
                            'Are you sure you want to reset status data?\nThis will delete your entire word database (seen, known, etc.)',
                            resetStatusDataStore
                        );
                    }}>Reset status data</Button>
                <Button onClick={
                    () => {
                        bringConfirmationDialog(
                            'Are you sure you want to reset global settings to default?\nThis will bring all settings in this window back to default.',
                            resetSettingsStore
                        );
                    }}>Reset global settings</Button>
                <Button onClick={
                    () => {
                        bringConfirmationDialog(
                            'Are you sure you want to reset history logs?\nThis will delete all saved translation history.',
                            resetHistoryStore
                        );
                    }}>Reset history logs</Button>
                <Button onClick={
                    () => {
                        bringConfirmationDialog(
                            'Are you sure you want to reset ALL settings to default?',
                            resetAllStores
                        );
                    }}>Reset EVERYTHING</Button>
            </div>
        </div>
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />}
    </>);
};