'use client'
import * as React from 'react';

import {
    InputBase,
    Switch,
    Stack,
    Typography,
    TextField,
    FormHelperText
} from '@mui/material';

import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

import GenomeSwitch from './GenomeSwitch';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
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

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));


//This needs to be able to take a prop to define the position of the toggle, and that allows the search to send the genome type in the query
//
export default function MainSearch() {
  return (
    <Stack direction='row' alignItems='center'>
      <TextField
        fullWidth
        variant='standard'
        label='Enter a gene name or alias, a genomic region in the form chr:start-end, a SNP rsID, or a cCRE accession.'
        placeholder='"K562”, “chr11:5205263-5381894", "rs4846913", "EH38E1613479"'
        helperText='You may also enter a cell type name to filter results.'
        sx={{
        }}
      />
      <GenomeSwitch />
    </Stack>
  )
}

