import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

type IState = {
    label: string
    name?: string
    type?: React.HTMLInputTypeAttribute
    optional?: boolean
    method?: (label: string) => any
    error?: (label: string) => boolean
    initialValue?: any
    value?: any
    multiline?: boolean
    rows?: number
}

type PickValue = any;
// { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]


declare global {
    interface Window {
        Confirm(text: string, caption?: string): Promise<Boolean>;
        Loading(content: string | boolean): void;
        Alert(text: string, delay?: number): Promise<Boolean>;
        Prompt<T extends IState>(text: string, data: T[]): Promise<T['name'] extends string ? PickValue : String[]>
    }
}

// window.Prompt('teste', [
//     { label: 'test', type: 'email', name: 'teste' }
// ])
// .then(data => {
// data.name
// })
// .catch((e) => {
//     e // false
// })

declare let resolveCallback: (value: Boolean | Object | PromiseLike<Boolean | Object>) => void
declare let rejectCallback: (value: Boolean | PromiseLike<Boolean>) => void;

const ReactMuiWindow: React.FC = () => {
    const [type, setType] = React.useState<"" | "PROMPT" | "ALERT" | "CONFIRM" | "LOADING">('');
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState('');
    const [caption, setCaption] = React.useState('');
    const [promptinputs, setPromptInputs] = React.useState<IState[]>([]);

    const PROMPT = type === "PROMPT";
    const ALERT = type === "ALERT";
    const CONFIRM = type === "CONFIRM";
    const LOADING = type === "LOADING";


    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!window.Confirm) {
                window.Confirm = (text) => {
                    setOpen(true)
                    setText(text)
                    setType("CONFIRM")
                    return new Promise((res, rej) => {
                        resolveCallback = res;
                        rejectCallback = rej;
                    })
                }
            }

            if (!window.Prompt) {
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

            if (!window.Alert) {
                window.Alert = (text, delay = 3000) => {
                    setType("ALERT");
                    setOpen(true);
                    setText(text);
                    return new Promise((res) => {
                        resolveCallback = res;
                        setTimeout(() => {
                            closeConfirm();
                        }, delay)
                    })
                }
            }

            if (!window.Loading) {
                window.Loading = (content, caption = '') => {
                    if (content) {
                        setType("LOADING");
                        setOpen(true);
                        setCaption(caption);
                        if (content && typeof content === 'string') {
                            setText(content);
                        }
                    } else {
                        closeConfirm();
                    }
                }
            }
        }

    }, []);

    const onConfirm = () => {
        /**
         * Prompt have inputs to fill
         */
        if (PROMPT) {
            /**
             * it will resolve with array with properties name
             */
            if (promptinputs?.[0]?.name) {
                const response = {};
                for (let index = 0; index < promptinputs.length; index++) {
                    const iterator = promptinputs[index];
                    if (iterator.name === undefined) {
                        throw ("hey!! the form for '" + iterator.label + "' must have a property { name: 'propname' }")
                    };
                    response[iterator.name] = iterator.value;
                }

                resolveCallback(response);
            } else {

                resolveCallback(Object.values(promptinputs.map(e => e.value)))
            }
        }
        /**
         * this is a simple confirm
         */
        else {
            resolveCallback(true)
        };

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
                    {!LOADING &&
                        <Typography variant="subtitle1" component="h3" color={theme => theme.palette.text.primary}>
                            {text}
                        </Typography>
                    }
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
                                    multiline={input.multiline}
                                    rows={input.rows}
                                    type={input.type}
                                    InputLabelProps={(input.type && input.type.indexOf('time') === -1) ? {
                                        shrink: true
                                    } : {}}
                                    onChange={(e) => {
                                        input.value = input.method ? input.method(e.target.value) : e.target.value;
                                        setPromptInputs([...promptinputs]);
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
                    {LOADING && <>
                        <Box sx={{ display: 'flex', justifyContent: text ? '' : 'center' }}>
                            <Box sx={{ p: 1 }}>
                                <CircularProgress />
                            </Box>
                            <Box sx={{ p: 1, display: 'flex', alignItems: 'flex-start', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="subtitle2">
                                    {text}
                                </Typography>
                                <Typography variant="caption">
                                    {caption}
                                </Typography>
                            </Box>
                        </Box>
                    </>}
                </Box>
            </Fade>
        </Modal>
    );

    return component;
    // return createPortal(component, document.getElementById('ReactMuiWindow'));
};
export default ReactMuiWindow;