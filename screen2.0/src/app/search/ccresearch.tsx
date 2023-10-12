"use client"
import React, { startTransition, useCallback, useEffect, useState } from "react"
import { styled } from '@mui/material/styles';
import { Divider, IconButton, Tab, Tabs, Typography, Box, Stack } from "@mui/material"
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


/**
 * @todo:
 * - Make (x) on cCREs have onClick accessible without navigating to tab too
 * - Fix issue with map
 * - Impose some kind of limit on open cCREs
 * - Have cmd click ("open new tab") functionality
 */

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

//Issue: when the URL is refreshed it triggers a rerender, which really hurts performance
// https://github.com/vercel/next.js/discussions/18072 relevant potential workaround
export const CcreSearch = (props: { mainQueryParams: MainQueryParams, globals }) => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const router = useRouter()
  const basePathname = usePathname()
  //Drawer open/close
  const [open, setOpen] = React.useState(true);
  //Need to have logic here to switch to the correct accession if multiple are open
  const [page, setPage] = useState(searchParams.get("accession") ? 2 : 0)
  const [detailsPage, setDetailsPage] = useState(0)
  const [tableRows, setTableRows] = useState<MainResultTableRows>([])
  const [loading, setLoading] = useState(false)
  const [opencCREs, setOpencCREs] = useState<{ ID: string, region: { start: string, chrom: string, end: string }, linkedGenes: LinkedGenesData }[]>([])

  const handleDrawerOpen = () => {setOpen(true)}
  const handleDrawerClose = () => {setOpen(false)}

  const handleTableClick = (row: MainResultTableRow) => {
    const newcCRE = {ID: row.accession, region: { start: row.start, end: row.end, chrom: row.chromosome}, linkedGenes: row.linkedGenes}
    //If cCRE isn't in open cCREs, add and push as current accession.
    if (!opencCREs.find((x) => x.ID === newcCRE.ID)) {
      setOpencCREs([... opencCREs, newcCRE])
      setPage([... opencCREs, newcCRE].length + 1)
      router.push(basePathname + "?" + createQueryString("accession", row.accession))
    } else {
      setPage(findTabByID(newcCRE.ID))
    }
  }

  const handleClosecCRE = (closedID: string) => {
    //Filter out cCRE
    const newOpencCREs = opencCREs.filter((cCRE) => cCRE.ID != closedID)
    setOpencCREs(newOpencCREs)

    const closedIndex = opencCREs.findIndex(x => x.ID === closedID)
    // Important to note that opencCREs here is still the old value

    // If you're closing a tab to the right of what you're on:
    if (closedIndex > (page - 2)) {
       // No action needed
    }
    // If you're closing the tab you're on:
    if (closedIndex === (page - 2)) {
      // If it is the last open:
      if (opencCREs.length === 1) {
        // Set to page 0
        setPage(0)
        setDetailsPage(0)
        // Change URL to ???
        router.push(basePathname + '?' + createQueryString("accession", ""))
      }
      // If it's the tab at the far right
      else if (page === (opencCREs.length + 1)) {
        // Page - 1
        setPage(page - 1)
        // URL to accession on the left
        router.push(basePathname + '?' + createQueryString("accession", opencCREs[closedIndex - 1].ID))
      }
      // Else it's not at the end or the last open:
      else {
        // Keep page position
        // Change URL to cCRE to the right
        router.push(basePathname + '?' + createQueryString("accession", opencCREs[closedIndex + 1].ID))
      }
    }
    // If you're closing a tab to the left of what you're on: 
    if (closedIndex < (page - 2)) {
      // Page count -= 1 to keep tab position
      setPage(page - 1)
      // Keep URL
    }
  }

  const handlePageChange = (_, newValue: number) => {
    console.log("page changed")
    setPage(newValue)
    //If switching to a cCRE, mirror in URL
    if (newValue >= 2) {
      router.push(basePathname + '?' + createQueryString("accession", opencCREs[newValue - 2].ID))
    }
  }

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    }, [searchParams]
  )

  //Fetch table rows
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

  //Used to set the list of selected accessions on initial load. Can't initialize normally since tableRows isn't loaded yet.
  //Why is this running again when noWipe is already true? It's running immediately before it fails
  useEffect(() => {
    const accession = searchParams.get("accession")
    if (accession && searchParams.get("noWipe") !== "t") {
      console.log("useEffect opencCREs initialized")
      const cCRE_info = tableRows.find((row) => row.accession === accession)
      if (cCRE_info) {
        const region = { start: cCRE_info?.start, chrom: cCRE_info?.chromosome, end: cCRE_info?.end }
        setOpencCREs([{ ID: cCRE_info.accession, region: region, linkedGenes: cCRE_info.linkedGenes }])
        //Is there a better way to flag this? If I don't, it will always reset open cCREs.
        //This is not a good solution, sharing the url of a loaded search will then not initialize.
        router.push(basePathname + "?" + createQueryString("noWipe", "t"))
      } else {
        console.log(`Couldn't find ${accession} in the table`)
      }
    }
  }, [tableRows, basePathname, router, searchParams, createQueryString])



  const findTabByID = (id: string) => {
    return(opencCREs.findIndex((x) => x.ID === id) + 2)
  }

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
            {opencCREs.length > 0 && opencCREs.map((cCRE, i) => {
              return (
                <StyledTab onClick={(event) => event.preventDefault} key={i} value={2 + i} label={cCRE.ID} icon={<IconButton onClick={(event) => {event.stopPropagation(); handleClosecCRE(cCRE.ID)}}><CloseIcon /></IconButton>} iconPosition="end"/>
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
        {/* {page >= 2 && opencCREs.length > 0 && (
          <CcreDetails
            accession={opencCREs[page - 2].ID}
            region={opencCREs[page - 2].region}
            globals={props.globals}
            assembly={props.mainQueryParams.assembly}
            genes={opencCREs[page - 2].linkedGenes}
            page={detailsPage}
          />
        )} */}
        {page >= 2 && opencCREs.length > 0 && opencCREs.map((cCRE, i) => {
          return (
            <Box key={i} display={page === (i + 2) ? "block" : "none"}>
              <CcreDetails
                key={cCRE.ID}
                accession={cCRE.ID}
                region={cCRE.region}
                globals={props.globals}
                assembly={props.mainQueryParams.assembly}
                genes={cCRE.linkedGenes}
                page={detailsPage}
              />
            </Box> 
          )
        })}
      </Main>
    </Box>
  )
}
