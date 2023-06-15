'use client'

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { Box, Paper } from '@mui/material';

import Link from 'next/link';

import { RangeSlider } from '@weng-lab/psychscreen-ui-components';

//Need to go back and define the types in mainQueryParams object
export default function MainResultsFilters(props: { mainQueryParams: any }) {
  //No alternatives provided for default, as all these attributes should exist and are given a default value in Search's page.tsx
  const [DNaseStart, setDNaseStart] = React.useState(props.mainQueryParams.dnase_s)
  const [DNaseEnd, setDNaseEnd] = React.useState(props.mainQueryParams.dnase_e)
  const [H3K4me3Start, setH3K4me3Start] = React.useState(props.mainQueryParams.h3k4me3_s)
  const [H3K4me3End, setH3K4me3End] = React.useState(props.mainQueryParams.h3k4me3_e)
  const [H3K27acStart, setH3K27acStart] = React.useState(props.mainQueryParams.h3k27ac_s)
  const [H3K27acEnd, setH3K27acEnd] = React.useState(props.mainQueryParams.h3k27ac_e)
  const [CTCFStart, setCTCFStart] = React.useState(props.mainQueryParams.ctcf_s)
  const [CTCFEnd, setCTCFEnd] = React.useState(props.mainQueryParams.ctcf_e)

  const constructURL = () => {
    const url = `search?assembly=${props.mainQueryParams.assembly}&chromosome=${props.mainQueryParams.chromosome}&start=${props.mainQueryParams.start}&end=${props.mainQueryParams.end}&dnase_s=${DNaseStart}&dnase_e=${DNaseEnd}&h3k4me3_s=${H3K4me3Start}&h3k4me3_e=${H3K4me3End}&h3k27ac_s=${H3K27acStart}&h3k27ac_e=${H3K27acEnd}&ctcf_s=${CTCFStart}&ctcf_e=${CTCFEnd}`
    return url
  }

  return (
    <Paper elevation={4}>
      <Box sx={{ minHeight: '64px', display: 'flex', alignItems: 'center'}}>
        <Typography variant='h5' sx={{ pl: '16px'}}>
          Refine Your Search
        </Typography>
      </Box>
      <Accordion square disableGutters>
      {/* <Accordion square>   */}
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Biosample Activity</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion square defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Chromatin Signals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RangeSlider
            title='DNase Z-Score'
            width='100%'
            defaultStart={DNaseStart}
            defaultEnd={DNaseEnd}
            min={-10}
            max={10}
            minDistance={1}
            step={0.1}
            //How do I correctly type this? Doesn't like Number[]
            onChange={(value: any) => {
              setDNaseStart(value[0])
              setDNaseEnd(value[1])
            }} />
          <RangeSlider
            title='H3K4me3 Z-Score'
            width='100%'
            defaultStart={H3K4me3Start}
            defaultEnd={H3K4me3End}
            min={-10}
            max={10}
            minDistance={1}
            step={0.1}
            onChange={(value: any) => {
              setH3K4me3Start(value[0])
              setH3K4me3End(value[1])
            }} />
          <RangeSlider
            title='H3K27ac Z-Score'
            width='100%'
            defaultStart={H3K27acStart}
            defaultEnd={H3K27acEnd}
            min={-10}
            max={10}
            minDistance={1}
            step={0.1}
            onChange={(value: any) => {
              setH3K27acStart(value[0])
              setH3K27acEnd(value[1])
            }} />
          <RangeSlider
            title='CTCF Z-Score'
            width='100%'
            defaultStart={CTCFStart}
            defaultEnd={CTCFEnd}
            min={-10}
            max={10}
            minDistance={1}
            step={0.1}
            onChange={(value: any) => {
              setCTCFStart(value[0])
              setCTCFEnd(value[1])
            }} />
        </AccordionDetails>
      </Accordion>
      <Accordion square disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>Classification</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion square disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4a-content"
          id="panel4a-header"
        >
          <Typography>Linked Genes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion square disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel5a-content"
          id="panel5a-header"
        >
          <Typography>Functional Characterization</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion square disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel6a-content"
          id="panel6a-header"
        >
          <Typography>Conservation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Link href={constructURL()}>
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          sx={{ mt: '16px', mb: '16px', ml: '16px', mr: '16px' }}
        >
          Filter Results
        </Button>
      </Link>
    </Paper>
  );
}