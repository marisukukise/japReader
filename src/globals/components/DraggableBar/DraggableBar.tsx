import './DraggableBar.scss';
import Logo from '@root/images/logo/logo.svg'

type Props = {
    title: string
}
export const DraggableBar = ({ title }: Props): JSX.Element => {
    return <div className="draggable-bar">
        <img className='bar-logo' src={Logo} />
        <div className='bar-title'>{title}</div>
    </div>;
};