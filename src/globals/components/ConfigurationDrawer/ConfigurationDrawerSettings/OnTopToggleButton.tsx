import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import { ipcRenderer } from 'electron';
import { useState } from 'react';

export default function OnTopToggleButton({ipcChannel}: {ipcChannel: string}) {
  const [selected, setSelected] = useState(false);

    const handleChange = () => {
        ipcRenderer.send(ipcChannel, !selected);
        setSelected(!selected)
    }

  return (
    <ToggleButton
      value="check"
      selected={selected}
      onChange={handleChange}
    >
      <CheckIcon />
    </ToggleButton>
  );
}