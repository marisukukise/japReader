import { useState } from 'react';

import Anchor from '@geist-ui/icons/anchor';
import Checkbox from '@geist-ui/core/esm/checkbox';

// TODO: Change this button to something better
type Props = {
  callback: (value: boolean) => void,
  initialChecked: boolean
}
const OnTopToggleButton = ({ callback, initialChecked }: Props): JSX.Element => {
    const [selected, setSelected] = useState(false);

    const handleChange = () => {
        callback(!selected);
        setSelected(!selected);
    };

    return (
        <Checkbox initialChecked={initialChecked} onChange={handleChange} checked={selected}><Anchor /></Checkbox>
    );
};

export default OnTopToggleButton;