import { Button, Grid, Modal as ModalGeist } from '@geist-ui/core';
import { ReactNode, useState } from 'react';

type Props = {
    title: string,
    subtitle: string,
    buttonText: string,
    children: ReactNode
}
export const Modal = ({ title, subtitle, buttonText, children }: Props): JSX.Element => {
    const [state, setState] = useState(false);
    const handler = () => setState(true);
    const closeHandler = () => {
        setState(false);
    };
    return (
        <div className="modal-component" >
            <Button auto onClick={handler}>{buttonText}</Button>
            <ModalGeist wrapClassName="modal-wrapper" visible={state} onClose={closeHandler}>
                <ModalGeist.Title>{title}</ModalGeist.Title>
                {subtitle ? <ModalGeist.Subtitle>{subtitle}</ModalGeist.Subtitle> : null}
                <ModalGeist.Content>
                    <Grid.Container gap={2} justify="center">
                        <Grid>{children}</Grid>
                    </Grid.Container>
                </ModalGeist.Content>
            </ModalGeist>
        </div>
    );
};