"use client"
import React, { startTransition, useEffect, useState } from "react"
import { styled, useTheme } from '@mui/material/styles';
import { Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilters from "../../common/components/MainResultsFilters"
import { CcreDetails } from "./ccredetails/ccredetails"
import Grid2 from "../../common/mui-client-wrappers/Grid2"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { GenomeBrowserView } from "./gbview/genomebrowserview"
import { MainQueryParams, MainResultTableRows } from "./types"
import { fetchRows } from "./fetchRows"
import { Drawer } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Box, { BoxProps as MuiBoxProps } from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 350;

export const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
}))

//Wrapper for the table
const Main = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  width: "100%",
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: 0,
  }),
}));

//Add open prop to box holding tabs
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
//Styled app bar, provides transitions and width/margins to account for drawer
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Customized div to position content correctly
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

export const CcreSearch = (props: { mainQueryParams: MainQueryParams, globals }) => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  //Maybe not necessary
  const theme = useTheme()
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = useState(searchParams.get("accession") ? 1 : 0)
  // const [tabIndex, setTabIndex] = useState(0)
  const [tableRows, setTableRows] = useState<MainResultTableRows>([])
  const [loading, setLoading] = useState(false)

  const handleChange = (_, newValue: number) => {
    setValue(newValue)
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (searchParams.get("accession")) {
      setValue(2)
    }
  }, [searchParams])

  //Need meaningful variable names please, is showing that this is undefined and throwing an error when using back button on details page since accession is undefined
  let f = tableRows.find((c) => c.accession === searchParams.get("accession"))
  const region = { start: f?.start, chrom: f?.chromosome, end: f?.end }

  useEffect(() => {
    setLoading(true)
    // @ts-expect-error
    //Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
    startTransition(async () => {
      if (props.mainQueryParams.bed_intersect) {
        setTableRows(await fetchRows(props.mainQueryParams, sessionStorage.getItem("bed intersect")?.split(' ')))
      } else {
        setTableRows(await fetchRows(props.mainQueryParams))
      }
      setLoading(false)
    })
  }, [props])

  return (
    <Box id="Outer Box" sx={{ display: 'flex'}}>
      <AppBar id="AppBar" position="fixed" open={open} elevation={1} sx={{bottom: "auto", top: "auto", backgroundColor: "white"}}>
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Tabs aria-label="basic tabs example" value={value} onChange={handleChange} component="div">
            <StyledTab value={0} label="Table View" />
            {!props.mainQueryParams.bed_intersect &&
              <StyledTab value={1} label="Genome Browser View" />
            }
            {searchParams.get("accession") &&
              <StyledTab value={2} label="cCRE Details" />
            }
          </Tabs>
        </Toolbar>
      </AppBar>
      <Drawer
        id="Drawer"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: "fixed",
            top: "auto",
            bottom: "auto",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        {/* Customized div to bump drawer content down */}
        <DrawerHeader>
          <Typography variant="h5" pl="0.4rem">
            Refine Your Search
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <MainResultsFilters mainQueryParams={props.mainQueryParams} byCellType={props.globals} />
        {/* Add sidebar nav for details, remove all but biosample for gbview */}
      </Drawer>
      <Main id="Main Content" open={open}>
        {/* Bumps content below app bar */}
        <DrawerHeader id="DrawerHeader" />
        {value === 0 && (
          <Box>
            <MainResultsTable
              
              rows={tableRows}
              tableTitle={props.mainQueryParams.bed_intersect ? `Intersecting by uploaded .bed file in ${props.mainQueryParams.assembly}${sessionStorage.getItem("warning") === "true" ? " (Partial)" : ""}` : `Searching ${props.mainQueryParams.chromosome} in ${props.mainQueryParams.assembly} from ${props.mainQueryParams.start.toLocaleString("en-US")} to ${props.mainQueryParams.end.toLocaleString("en-US")}`}
              itemsPerPage={10}
              titleHoverInfo={props.mainQueryParams.bed_intersect ? `${sessionStorage.getItem("warning") === "true" ? "The file you uploaded, " + sessionStorage.getItem('filenames') + ", is too large to be completely intersected. Results are incomplete." : sessionStorage.getItem('filenames')}` : null}
              loading={loading} />
          </Box>
          // <ColumnGroupingTable />
        )}
        {value === 1 && (
          <GenomeBrowserView
            gene={props.mainQueryParams.gene}
            biosample={props.mainQueryParams.Biosample.biosample}
            assembly={props.mainQueryParams.assembly}
            coordinates={{ start: +props.mainQueryParams.start, end: +props.mainQueryParams.end, chromosome: props.mainQueryParams.chromosome }}
          />
        )}
        {value === 2 && (
          <CcreDetails
            accession={searchParams.get("accession")}
            region={region}
            globals={props.globals}
            assembly={props.mainQueryParams.assembly}
            genes={f?.linkedGenes}
          />
        )}
      </Main>
    </Box>
  )
}
