import { Button, ButtonGroup } from '@geist-ui/core';
import { getWindowStore } from '@globals/ts/main/initializeStore';
import { useState } from 'react';
const windowStore = getWindowStore();

type Props = {
    windowName: string,
    label: string,
    storeProperty: string,
    callback: (windowName: string, conditionForZoomIn: boolean) => string
}
const ZoomButtonGroup = ({ windowName, label, storeProperty, callback }: Props): JSX.Element => {
    const [length, setLength] = useState(windowStore.get(storeProperty, 0));
    return <div className="zoom-button-group-wrapper">
        {label} {length}
        <ButtonGroup>
            <Button onClick={() => setLength(callback(windowName, false))}>-</Button>
            <Button onClick={() => setLength(callback(windowName, true))}>+</Button>
        </ButtonGroup>
    </div>;
};

export default ZoomButtonGroup;