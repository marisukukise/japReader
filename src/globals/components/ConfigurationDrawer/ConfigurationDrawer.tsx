import Button from '@geist-ui/core/esm/button';
import ChevronUp from '@geist-ui/icons/chevronUp';
import Drawer from '@geist-ui/core/esm/drawer';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { ChevronDown } from '@geist-ui/icons';


type Props = {
  settings: JSX.Element
}
const ConfigurationDrawer = ({ settings }: Props): JSX.Element => {
    const [state, setState] = useState(false);
    const open = () => { setState(true); };
    const close = () => { setState(false); };

    useEffect(() => {
        ipcRenderer.on('blur', (event: any) => {
            close();
        });
    }, []);

    return (
        <div className="drawer-component">
            <Button ghost auto scale={2 / 3} px={0.6}
                style={{ zIndex: 99, position: 'fixed', bottom: 10, left: 10 }}
                onClick={open}
                iconRight={<ChevronUp />}
            />
            <Drawer wrapClassName="drawer-wrapper" visible={state} onClose={close} placement='bottom'>
                <Button ghost auto scale={2 / 3} px={0.6}
                    style={{ zIndex: 99, position: 'fixed', bottom: 10, left: 10 }}
                    onClick={close}
                    iconRight={<ChevronDown />}
                />
                <Drawer.Title>Window-specific settings</Drawer.Title>
                <Drawer.Subtitle>These options will be applied to the current window</Drawer.Subtitle>
                <Drawer.Content style={{ marginLeft: 10 }}>
                    <div className="settings">
                        {settings}
                    </div>
                </Drawer.Content>
            </Drawer>
        </div>
    );
};

export default ConfigurationDrawer;