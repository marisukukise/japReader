import { Modal } from "@globals/components/Modal/Modal";
import WindowColorPicker from "./WindowColorPicker";

export default function ColorPickerButton({ callback, title, subtitle, buttonText }: any) {
    return <Modal buttonText={buttonText} title={title} subtitle={subtitle}><WindowColorPicker callback={callback} /></Modal>
}