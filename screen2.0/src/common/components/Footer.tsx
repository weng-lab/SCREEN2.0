'use client'
import { 
    Typography,
    Container,
    Box
} from "@mui/material";

import MuiLink from '@mui/material/Link';

export default function Footer() {
    return (
        //This positioning needs to change. Need it to be attached to bottom by scroll. Not attached by attaching to bottom of viewport
        <Box id='Footer' sx={{ position: "absolute", bottom: "0", textAlign: 'center', width: '100%', height: "4rem"}}>
            <Typography variant="body2" color="text.secondary">
                {'Copyright © '}
                <MuiLink color="inherit" href="https://www.umassmed.edu/zlab/">
                    Weng Lab
                </MuiLink>{', '}
                <MuiLink color="inherit" href="https://www.moore-lab.org/">
                    Moore Lab
                </MuiLink>{' '}
                {new Date().getFullYear()}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
                How to Cite the ENCODE Encyclopedia, the Registry of cCREs, and SCREEN:
            </Typography>
            <Typography variant="body2" color="text.secondary">
            &quot;ENCODE Project Consortium, et al. Nature 2020.&quot;
            </Typography>
        </Box>
    )
}