"use client"
import React, { startTransition, useCallback, useEffect, useState } from "react"
import { styled } from '@mui/material/styles';
import { Divider, IconButton, Tab, Tabs, Typography, Box } from "@mui/material"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilters from "../../common/components/MainResultsFilters"
import { CcreDetails } from "./ccredetails/ccredetails"
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { GenomeBrowserView } from "./gbview/genomebrowserview"
import { LinkedGenesData, MainQueryParams, MainResultTableRow, MainResultTableRows } from "./types"
import { fetchRows } from "./fetchRows"
import { Drawer } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 350;

const StyledTab = styled(Tab)(() => ({
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

//It's honestly not great having mainQueryParams set in page and only the page number accessed here through searchParams.
//Doesn't make that much sense to access the URL params in two different places if it all can be accessed and set in both locations.

//The biggest thing I'm confused abotu is when I have a state variable synced and set with a URL param, how should I set the state/url variable properly for performance reasons?
export const CcreSearch = (props: { mainQueryParams: MainQueryParams, globals }) => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const router = useRouter()
  const basePathname = usePathname()
  //Drawer open/close
  const [open, setOpen] = React.useState(true);
  const [page, setPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 0)
  const [detailsPage, setDetailsPage] = useState(0)
  const [tableRows, setTableRows] = useState<MainResultTableRows>([])
  const [loading, setLoading] = useState(false)
  const [opencCREs, setOpencCREs] = useState<{ ID: string, region: { start: string, chrom: string, end: string }, linkedGenes: LinkedGenesData }[]>([])

  //I think this isn't working since the table rows are blank, and the blank rows are being searched. Maybe use useEffect that triggers on change of tableRows.

  const handleDrawerOpen = () => {setOpen(true)}
  const handleDrawerClose = () => {setOpen(false)}

  const handleTableClick = (row: MainResultTableRow) => {
    console.log(row)
    const newcCRE = {ID: row.accession, region: { start: row.start, end: row.end, chrom: row.chromosome}, linkedGenes: row.linkedGenes}
    //if accession(s) exist in url, and the clicked accession is not already selected
    if (searchParams.get("accession") && !searchParams.get("accession").split(',').includes(row.accession)){
      //append to existing list
      const newcCREs = [... opencCREs, newcCRE]
      setOpencCREs(newcCREs)
      router.push(basePathname + "?" + createQueryString("accession", `${searchParams.get("accession") + ',' + row.accession}`))
      // handlePageChange(undefined, newcCREs.length + 1)
    } else if (!searchParams.get("accession")) {
      //create fresh param
      setOpencCREs([newcCRE])
      router.push(basePathname + "?" + createQueryString("accession", row.accession))
      // handlePageChange(undefined, 2)
    }
  }

  const handleClosecCRE = (closedcCRE: string) => {
    //filter out cCRE from array and set state
    const newcCREs = opencCREs.filter((cCRE) => cCRE.ID != closedcCRE)
    setOpencCREs(newcCREs)
    //TODO if closing the tab you're on, and there is no page that exists to the right, go to the left
    router.push(basePathname + '?' + createQueryString("accession", newcCREs.map((cCRE_info) => cCRE_info.ID).join(',')))
  }

  const handlePageChange = (_, newValue: number) => {
    setPage(newValue)
    //This is creating a flash in the table (frustrating). Is there a fix? This is slowing it all down a lot
    router.push(basePathname + "?" + createQueryString("page", String(newValue)))
  }

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    }, [searchParams]
  )

  useEffect(() => {
    console.log("useEffect table rows fetched")
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

  //Necessary to force page change when searching for a cCRE. Otherwise doesn't refresh. Maybe slowing performance?
  useEffect(() => {
    console.log("useEffect page updated")
    setPage(Number(searchParams.get("page")))
  }, [searchParams.get("page")])

  //Used to set the list of selected accessions on initial load. Can't initialize normally since tableRows isn't loaded yet.
  useEffect(() => {
    console.log("useEffect opencCREs initialized")
    if (searchParams.get("accession")) {
      setOpencCREs(
        searchParams.get("accession").split(',').map((cCRE_ID) => {
          const cCRE_info = tableRows.find((row) => row.accession === cCRE_ID)
          if (!cCRE_info) {
            return null
          } else {
            console.log("accession found")
            const region = { start: cCRE_info?.start, chrom: cCRE_info?.chromosome, end: cCRE_info?.end }
            return ({ ID: cCRE_ID, region: region, linkedGenes: cCRE_info.linkedGenes })
          }
        }).filter((x) => x != null)
      )
    }
  }, [tableRows])

  return (
    <Box id="Outer Box" sx={{ display: 'flex' }}>
      <AppBar id="AppBar" position="fixed" open={open} elevation={1} sx={{ bottom: "auto", top: "auto", backgroundColor: "white" }}>
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
          <Tabs aria-label="navigation tabs" value={page} onChange={handlePageChange} component="div">
            <StyledTab value={0} label="Table View" />
            {/* Hide genome browser on bed intersect */}
            {!props.mainQueryParams.bed_intersect &&
              <StyledTab value={1} label="Genome Browser View" />
            }
            {/* Map opencCREs to tabs */}
            {opencCREs && opencCREs.map((cCRE, i) => {
              return (
                <StyledTab key={i} value={2 + i} label={cCRE.ID} icon={<IconButton onClick={() => handleClosecCRE(cCRE.ID)}><CloseIcon /></IconButton>} iconPosition="end"/>
              )
            })}
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
            {`${page < 2 ? "Refine Your Search" : "cCRE Details"}`}
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        {page < 2 ?
          //This is recalculating whenever the expression evaluates differently (bad)
          <MainResultsFilters mainQueryParams={props.mainQueryParams} byCellType={props.globals} genomeBrowserView={page === 1} />
          :
          <Tabs aria-label="details-tabs" value={detailsPage} onChange={(_, newValue: number) => { setDetailsPage(newValue) }} orientation="vertical" variant="fullWidth">
            <StyledTab label="In Specific Biosamples" sx={{ alignSelf: "start" }} />
            <StyledTab label="Linked Genes" sx={{ alignSelf: "start" }} />
            <StyledTab label="Nearby Genomic Features" sx={{ alignSelf: "start" }} />
            <StyledTab label="TF and His-mod Intersection" sx={{ alignSelf: "start" }} />
            <StyledTab label="TF Motifs and Sequence Features" sx={{ alignSelf: "start" }} />
            <StyledTab label="Linked cCREs in other Assemblies" sx={{ alignSelf: "start" }} />
            <StyledTab label="Associated RAMPAGE Signal" sx={{ alignSelf: "start" }} />
            <StyledTab label="Associated Gene Expression" sx={{ alignSelf: "start" }} />
            <StyledTab label="Functional Data" sx={{ alignSelf: "start" }} />
          </Tabs>
        }
        {/* Add sidebar nav for details*/}
      </Drawer>
      <Main id="Main Content" open={open}>
        {/* Bumps content below app bar */}
        <DrawerHeader id="DrawerHeader" />
        {page === 0 && (
          <Box>
            <MainResultsTable
              rows={tableRows}
              tableTitle={props.mainQueryParams.bed_intersect ?
                `Intersecting by uploaded .bed file in ${props.mainQueryParams.assembly}${sessionStorage.getItem("warning") === "true" ? " (Partial)" : ""}`
                :
                `Searching ${props.mainQueryParams.chromosome} in ${props.mainQueryParams.assembly} from ${props.mainQueryParams.start.toLocaleString("en-US")} to ${props.mainQueryParams.end.toLocaleString("en-US")}`
              }
              titleHoverInfo={props.mainQueryParams.bed_intersect ?
                `${sessionStorage.getItem("warning") === "true" ? "The file you uploaded, " + sessionStorage.getItem('filenames') + ", is too large to be completely intersected. Results are incomplete."
                :
                sessionStorage.getItem('filenames')}` : null
              }
              itemsPerPage={10}
              loading={loading}
              onRowClick={handleTableClick}
            />
          </Box>
        )}
        {page === 1 && (
          <GenomeBrowserView
            gene={props.mainQueryParams.gene}
            biosample={props.mainQueryParams.Biosample.biosample}
            assembly={props.mainQueryParams.assembly}
            coordinates={{ start: +props.mainQueryParams.start, end: +props.mainQueryParams.end, chromosome: props.mainQueryParams.chromosome }}
          />
        )}
        {/* Issue: on reload with page selected, it's attempting to access opencCREs when it's not populated as the table rows havent been fetched */}
        {page >= 2 && opencCREs.length > 0 && (
          <CcreDetails
            accession={opencCREs[page - 2].ID}
            region={opencCREs[page - 2].region}
            globals={props.globals}
            assembly={props.mainQueryParams.assembly}
            genes={opencCREs[page - 2].linkedGenes}
            page={detailsPage}
          />
        )}
      </Main>
    </Box>
  )
}
