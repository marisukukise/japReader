import Button from '@geist-ui/core/esm/button';
import ChevronUp from '@geist-ui/icons/chevronUp';
import Drawer from '@geist-ui/core/esm/drawer';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { ChevronDown , QuestionCircle } from '@geist-ui/icons';



type Props = {
    settings: JSX.Element
}

// TODO: Add scrolling option to the drawer

const ConfigurationDrawer = ({ settings }: Props): JSX.Element => {
    const [isOpen, setOpen] = useState(false);
    const open = () => { setOpen(true); };
    const close = () => { setOpen(false); };

    useEffect(() => {
        ipcRenderer.on('blur', (event: any) => {
            close();
        });
    }, []);

    const PROTIPS = 'Protips:\n\
    1. You can change the status of words with left/right mouse clicks;\n\
    2. Press H to hide the window borders;\n\
    3. Press Alt+H to bring all the windows up;\n\
    4. Zoom font with +/- buttons or Ctrl+Scroll;\n\
    5. You can change the window color to transparent;\n\
    6. For better text visibility you can increase "font glow"\n\
    7. Set the window to "always on top" for apps on fullscreen;\n\
    \n\
    This is the alpha version of the program so it may be bugged, but it should be mostly usable.\n\
    If you encounter bugs you can open an issue on japReader github.\n\
    Have fun!';

    return (
        <div className="drawer-component">
            <Button ghost auto scale={2 / 3} px={0.6}
                style={{ zIndex: 1001, position: 'fixed', bottom: 10, left: 10 }}
                onClick={isOpen ? close : open}
                iconRight={isOpen ? <ChevronDown /> : <ChevronUp />}
            />
            <Drawer wrapClassName="drawer-wrapper" visible={isOpen} onClose={close} placement='bottom'
                style={{ position: 'static', borderRadius: '6px'}}
            >
                <div title={PROTIPS} className="protips" style={{ position: 'absolute', top: 10, right: 10 }}>
                    <QuestionCircle size={30}/>
                </div>
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