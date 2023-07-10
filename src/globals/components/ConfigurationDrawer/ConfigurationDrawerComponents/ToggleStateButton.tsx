import { Toggle } from '@geist-ui/core';

type Props = {
    fn: () => void,
    initialChecked: boolean,
    text: string,
}
const ToggleStateSwitch = ({ fn, initialChecked, text }: Props): JSX.Element => {
    return <div className="toggle-switch">
        {text}
        <Toggle
            initialChecked={initialChecked}
            onChange={fn}
        /></div>;
};

export default ToggleStateSwitch;