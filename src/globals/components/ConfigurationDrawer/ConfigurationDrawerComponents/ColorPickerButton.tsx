import { Modal } from '@globals/components/Modal/Modal';
import WindowColorPicker from './WindowColorPicker';

type Props = {
    callback: (color: string) => void,
    title: string,
    subtitle: string,
    buttonText: string,
    storeProperty: string
}
const ColorPickerButton = ({ callback, title, subtitle, buttonText, storeProperty }: Props): JSX.Element => {
    return <Modal 
        buttonText={buttonText}
        title={title}
        subtitle={subtitle}>
        <WindowColorPicker
            storeProperty={storeProperty}
            callback={callback} />
    </Modal>;
};

export default ColorPickerButton;