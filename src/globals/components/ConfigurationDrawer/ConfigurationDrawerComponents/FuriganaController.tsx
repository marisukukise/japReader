import { Checkbox } from '@geist-ui/core';
import { STATUS } from '@root/src/globals/ts/other/objects';

type Props = {
    initialChecked: string[],
    fn: (values: string[]) => void
}
const FuriganaController = ({initialChecked, fn}: Props): JSX.Element => {

    return <div>Show furigana in: <Checkbox.Group value={initialChecked} onChange={fn}>
        <Checkbox value={STATUS.NEW}>New</Checkbox>
        <Checkbox value={STATUS.SEEN}>Seen</Checkbox>
        <Checkbox value={STATUS.KNOWN}>Known</Checkbox>
        <Checkbox value={STATUS.IGNORED}>Ignored</Checkbox>
    </Checkbox.Group></div>;
};

export default FuriganaController;