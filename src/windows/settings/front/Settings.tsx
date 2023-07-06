import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from "@globals/ts/main/setupLogging";
const log = createScopedLog(log_renderer, 'settings')

import { DraggableBar } from "@globals/components/DraggableBar/DraggableBar";
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

import { Page } from '@geist-ui/core'

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dark_mode,
]

export const Settings = () => {
    return (<>
        <DraggableBar />
        <Page>

        </Page>
        <ConfigurationDrawer settings={settings} />
    </>)
}