import { ipcRenderer } from 'electron';
import { useState } from 'react';

import Anchor from '@geist-ui/icons/anchor';
import Checkbox from '@geist-ui/core/esm/checkbox';

// TODO: Change this button to something better
type Props = {
  ipcChannel: string
}
const OnTopToggleButton = ({ ipcChannel }: Props): JSX.Element => {
    const [selected, setSelected] = useState(false);

    const handleChange = () => {
        ipcRenderer.send(ipcChannel, !selected);
        setSelected(!selected);
    };

    return (
        <Checkbox onChange={handleChange} checked={selected}><Anchor /></Checkbox>
    );
};

export default OnTopToggleButton;