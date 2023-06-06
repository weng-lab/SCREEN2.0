'use client'
import * as React from 'react';

import {
    InputBase,
    Switch,
    Stack,
    Typography,
    TextField,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputBaseProps
} from '@mui/material';

import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

import GenomeSwitch from './GenomeSwitch';

export type MainSearchProps = InputBaseProps & {
    /**
     * false for human, true for mouse
     */
    initialChecked?: boolean;
    // onChange?: (checked: boolean) => void;
}

//This needs to be able to take a prop to define the position of the toggle, and that allows the search to send the genome type in the query
//
const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {

    const [value, setValue] = React.useState("");
    const [checked, setChecked] = React.useState(props.initialChecked || false);

    const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setValue(event.target.value);
    };

    const handleSubmit = () => {
        window.alert("Submitted with value: " + value + " and checked: " + checked);
    }

    return (
        <Stack direction={'row'} sx={{mt:'1em'}}>
            {/* Wrap search in <form> component. onSubmit() is triggered when the submit button clicked or "enter" pressed when editing the text */}
            <form onSubmit={handleSubmit} style={{display: "flex", flexGrow: 1}}>
                <TextField
                    fullWidth
                    variant='outlined'
                    InputLabelProps={{shrink: true}}
                    label='Enter a gene name or alias, a genomic region in the form chr:start-end, a SNP rsID, or a cCRE accession.'
                    placeholder='"K562”, “chr11:5205263-5381894", "rs4846913", "EH38E1613479"'
                    // helperText='You may also enter a cell type name to filter results.'
                    value={value}
                    onChange={handleChange}
                    InputProps={{
                        endAdornment:
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Search"
                                    type='submit'
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                    }}
                    sx={{mr: "1em"}}
                />
            </form>
            <GenomeSwitch
                initialChecked={props.initialChecked && props.initialChecked}
                checked={checked}
                onSwitchChange={(checked) => setChecked(checked)}
            />
        </Stack>
    )
}

export default MainSearch
