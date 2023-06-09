'use client'
import * as React from 'react';

import {
    InputBase,
    InputBaseProps,
    Stack,
    InputAdornment,
    IconButton
} from '@mui/material';

import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

import GenomeSwitch from './GenomeSwitch';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    marginRight: '1rem',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(${theme.spacing(1.5)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '16ch',
            '&:focus': {
                width: '25ch',
            },
        },
        [theme.breakpoints.up('lg')]: {
            width: '30ch',
            '&:focus': {
                width: '40ch',
            },
        },
    },
}));

/**
 * Search bar contains a value
 * Toggle contains a position (or a boolean value)
 *  
 */
export type HeaderSearchProps = InputBaseProps & {
    /**
     * false for human, true for mouse
     */
    initialChecked?: boolean;
    // onChange?: (checked: boolean) => void;
};

const HeaderSearch: React.FC<HeaderSearchProps> = (props: HeaderSearchProps) => {

    const [value, setValue] = React.useState("");
    const [checked, setChecked] = React.useState(props.initialChecked || false);

    function handleChange(event: { target: { value: React.SetStateAction<string>; }; }) {
        setValue(event.target.value);
    };

    function handleSubmit() {
        // parseInput(value, checked);
        window.alert("Submitted with value: " + value + " and checked: " + checked);
    }

    // function parseInput(value: string, checked: boolean) {


    // }

    return (
        <Stack direction='row' alignItems='center'>
            {/* Wrap search in <form> component. onSubmit() is triggered when the submit button clicked or "enter" pressed when editing the text */}
            <form onSubmit={handleSubmit}>
                <Search>
                    <StyledInputBase
                        placeholder='Search SCREEN'
                        inputProps={{ 'aria-label': 'search' }}
                        fullWidth
                        value={value}
                        onChange={handleChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Search"
                                    type='submit'
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </Search>
            </form>
            <GenomeSwitch
                initialChecked={props.initialChecked && props.initialChecked}
                checked={checked}
                onSwitchChange={(checked) => setChecked(checked)}
            />
        </Stack>
    )
}

export default HeaderSearch;