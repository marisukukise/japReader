import { Checkbox } from '@geist-ui/core';
import { WORD_DATA_STATUSES } from '@globals/ts/main/objects';

type Props = {
    initialChecked: string[],
    fn: (values: string[]) => void
}
const FuriganaController = ({initialChecked, fn}: Props): JSX.Element => {

    return <Checkbox.Group value={initialChecked} onChange={fn}>
        <Checkbox value={WORD_DATA_STATUSES.NEW}>New</Checkbox>
        <Checkbox value={WORD_DATA_STATUSES.SEEN}>Seen</Checkbox>
        <Checkbox value={WORD_DATA_STATUSES.KNOWN}>Known</Checkbox>
        <Checkbox value={WORD_DATA_STATUSES.IGNORED}>Ignored</Checkbox>
    </Checkbox.Group>;
};

export default FuriganaController;