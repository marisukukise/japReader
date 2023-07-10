import { Button, ButtonGroup } from "@geist-ui/core";
import { zoom } from "@globals/ts/renderer/helpers";

export default function ZoomButtonGroup({windowName}: any) {
    return <div className="zoom-button-group-wrapper">
        Font size: 
    <ButtonGroup>
        <Button onClick={() => zoom(windowName, false)}>-</Button>
        <Button onClick={() => zoom(windowName, true)}>+</Button>
    </ButtonGroup>
    </div>
}