import GeistLoader from '@geist-ui/icons/loader';
import './Loader.scss';

const Loader = (): JSX.Element => {
    return (<span className="loader-icon">
        <GeistLoader />
    </span>);
};

export default Loader;