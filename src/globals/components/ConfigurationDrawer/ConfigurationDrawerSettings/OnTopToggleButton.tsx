import { ipcRenderer } from 'electron';
import { useState } from 'react';

import Anchor from '@geist-ui/icons/anchor'
import Checkbox from '@geist-ui/core/esm/checkbox';

export default function OnTopToggleButton({ ipcChannel }: { ipcChannel: string }) {
  const [selected, setSelected] = useState(false);

  const handleChange = () => {
    ipcRenderer.send(ipcChannel, !selected);
    setSelected(!selected)
  }

  return (
    <Checkbox onChange={handleChange} checked={selected}><Anchor /></Checkbox>
  );
}