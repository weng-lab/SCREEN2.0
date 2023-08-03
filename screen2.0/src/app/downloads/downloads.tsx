"use client"

import * as React from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Container,
  ThemeProvider,
} from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

import { QuickStart } from './quick-start';
import { DetailedElements } from './detailed-elements';
import { DataMatrices } from './data-matrices';
import { useMemo } from 'react';
import { defaultTheme } from '../../common/lib/themes';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function DownloadsPage(props: { biosamples: any }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container>
        <Grid2 mt={2} container spacing={2}>
          <Grid2 xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Quick Start" {...a11yProps(0)} />
                <Tab label="Detailed Elements" {...a11yProps(1)} />
                <Tab label="Data Matrices" {...a11yProps(2)} />
              </Tabs>
            </Box>
          </Grid2>
          <Grid2 xs={12}>
            <QuickStart value={value} biosamples={props.biosamples} />
            <DetailedElements value={value} biosamples={props.biosamples} />
            <DataMatrices value={value} biosamples={props.biosamples} />
          </Grid2>
        </Grid2>
      </Container>
    </ThemeProvider>
  )
}
