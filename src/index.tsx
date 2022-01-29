import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

type IState = {
    label: string
    type?: string
    optional?: boolean
    method?: (label: string) => any
    error?: (label: string) => boolean
    initialValue?: any
    value?: any
}

declare global {
    interface Window {
        Confirm(text: string): Promise<Boolean>;
        Alert(text: string, delay?: number): Promise<Boolean>;
        Prompt(text: string, data: IState[]): Promise<string[]>;
    }
}

declare let resolveCallback: (value: Boolean | string[] | PromiseLike<Boolean | string[]>) => void
declare let rejectCallback: (value: Boolean | PromiseLike<Boolean>) => void;

const ReactMuiWindow: React.FC = () => {
    const [type, setType] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState('');
    const [promptinputs, setPromptInputs] = React.useState<IState[]>([]);

    const PROMPT = type === "PROMPT";
    const ALERT = type === "ALERT";
    const CONFIRM = type === "CONFIRM";


    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (typeof window.Confirm === 'undefined') {
                window.Confirm = (text) => {
                    setOpen(true)
                    setText(text)
                    setType("CONFIRM")
                    return new Promise((res) => {
                        resolveCallback = res;
                    })
                }
            }

            if (typeof window.Prompt === 'undefined') {
                window.Prompt = (text, promptInput) => {
                    setOpen(true);
                    setText(text);
                    setType("PROMPT");
                    setPromptInputs(promptInput.map(e => ({ ...e, value: e.initialValue || '' })));

                    return new Promise((res, rej) => {
                        resolveCallback = res;
                        rejectCallback = rej;
                    })
                }
            }

            if (typeof window.Alert === 'undefined') {
                window.Alert = (text, delay = 3000) => {
                    setType("ALERT")
                    setOpen(true)
                    setText(text)
                    return new Promise((res) => {
                        resolveCallback = res;
                        setTimeout(() => {
                            closeConfirm();
                        }, delay)
                    })
                }
            }
        }

    }, []);

    const onConfirm = () => {
        if (PROMPT) resolveCallback(Object.values(promptinputs.map(e => e.value)))
        else resolveCallback(true);
        closeConfirm();
    };

    const onCancel = () => {
        closeConfirm();
        rejectCallback(false);
    };

    const closeConfirm = () => {
        setOpen(false);
        setTimeout(() => {
            setType('');
            setPromptInputs([]);
        }, 150)
    };
    const component = (
        <Modal
            open={open}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 155 }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    transform: 'translate(-50%, -10%)',
                    width: { md: 400, xs: '85%' },
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: { md: 4, xs: 2 },
                }}>
                    <Typography variant="subtitle1" component="h3">
                        {text}
                    </Typography>
                    {PROMPT && <>
                        <Divider sx={{ margin: 2 }} />
                        <form onSubmit={(e) => { e.preventDefault(); return onConfirm() }}>
                            {promptinputs.map((input, index) => (
                                <TextField
                                    fullWidth
                                    autoFocus={index === 0}
                                    key={`ReactMuiWindow-${input.label}`}
                                    margin="normal"
                                    required={!input.optional}
                                    size="small"
                                    error={(input.error) ? input.error(input.value) : false}
                                    label={input.label}
                                    value={input.value}
                                    type={input.type}
                                    InputLabelProps={{
                                        shrink: (input.type && input.type.indexOf('time') === -1) ? true : false
                                    }}
                                    onChange={(e) => {
                                        input.value = input.method ? input.method(e.target.value) : e.target.value
                                        setPromptInputs(promptinputs);
                                    }}
                                />
                            ))}
                            <Divider sx={{ margin: 3 }} />
                            <Box width="100%" display="flex">
                                <Button
                                    onClick={onCancel}
                                    sx={{ flexGrow: 1, marginRight: 2 }}
                                    color="error">
                                    Cancelar
                                </Button>
                                <Button
                                    sx={{ flexGrow: 1 }}
                                    disabled={!promptinputs.filter(i => !i.optional).every(i => i.value)}
                                    type="submit"
                                    variant="contained">
                                    Salvar
                                </Button>
                            </Box>
                        </form>
                    </>}
                    {CONFIRM && <>
                        <Divider sx={{ margin: 3 }} />
                        <Box width="100%" display="flex">
                            <Button onClick={onCancel} sx={{ flexGrow: 1, marginRight: 2 }} color="error">Cancelar</Button>
                            <Button onClick={onConfirm} sx={{ flexGrow: 1 }} variant="contained">Sim</Button>
                        </Box>
                    </>}
                    {ALERT && <>
                        <Divider sx={{ margin: 3 }} />
                        <Box width="100%" display="flex">
                            <Button sx={{ marginLeft: 'auto' }} onClick={onConfirm} >Ok</Button>
                        </Box>
                    </>}
                </Box>
            </Fade>
        </Modal>
    );
    return component
    // return createPortal(component, document.getElementById('ReactMuiWindow'));
};
export default ReactMuiWindow;