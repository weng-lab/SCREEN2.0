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
import Rampage from "./ccredetails/rampage";
import { GeneExpression } from "./ccredetails/gene-expression";

/**
 * @todo:
 * - Impose some kind of limit on open cCREs
 * - Have cmd click ("open new tab") functionality
 * 
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
  const [open, setOpen] = React.useState(true);
  const [page, setPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 0)
  const [detailsPage, setDetailsPage] = useState(0)
  const [tableRows, setTableRows] = useState<MainResultTableRows>([])
  const [loading, setLoading] = useState(false)
  const [opencCREs, setOpencCREs] = useState<{ ID: string, region: { start: string, chrom: string, end: string }, linkedGenes: LinkedGenesData }[]>([])

  const handleDrawerOpen = () => { setOpen(true) }
  const handleDrawerClose = () => { setOpen(false) }

  const numberOfDefaultTabs = searchParams.get("gene") ? (props.mainQueryParams.assembly.toLowerCase() === "mm10" ? 3 : 4) : 2
  const handleTableClick = (row: MainResultTableRow) => {
    if (opencCREs.length > 6) { window.alert("Open cCRE limit reached! Please close cCREs to open more") }
    const newcCRE = { ID: row.accession, region: { start: row.start, end: row.end, chrom: row.chromosome }, linkedGenes: row.linkedGenes }
    //If cCRE isn't in open cCREs, add and push as current accession.

    if (!opencCREs.find((x) => x.ID === newcCRE.ID)) {
      setOpencCREs([...opencCREs, newcCRE])
      setPage(opencCREs.length + numberOfDefaultTabs)
      router.push(basePathname + "?" + createQueryString("accession", [...opencCREs, newcCRE].map((x) => x.ID).join(','), "page", String(opencCREs.length + numberOfDefaultTabs)))
    } else {
      const newPage = findTabByID(newcCRE.ID, numberOfDefaultTabs)
      setPage(newPage)
      router.push(basePathname + "?" + createQueryString("page", String(newPage)))
    }
  }

  const handleClosecCRE = (closedID: string) => {
    //Filter out cCRE
    const newOpencCREs = opencCREs.filter((cCRE) => cCRE.ID != closedID)
    setOpencCREs(newOpencCREs)

    const closedIndex = opencCREs.findIndex(x => x.ID === closedID)
    // Important to note that opencCREs here is still the old value

    // If you're closing a tab to the right of what you're on:
    if (closedIndex > (page - numberOfDefaultTabs)) {
      //Close cCREs in URL
      router.push(basePathname + '?' + createQueryString("accession", newOpencCREs.map((x) => x.ID).join(',')))
    }
    // If you're closing the tab you're on:
    if (closedIndex === (page - numberOfDefaultTabs)) {
      // If it is the last open:
      if (opencCREs.length === 1) {
        // Set to page 0
        setPage(0)
        setDetailsPage(0)
        // Change URL to ???
        router.push(basePathname + '?' + createQueryString("accession", "", "page", "0"))
      }
      // If it's the tab at the far right
      else if (page === (opencCREs.length + (numberOfDefaultTabs - 1))) {
        // Page - 1
        setPage(page - 1)
        // URL to accession on the left
        router.push(basePathname + '?' + createQueryString("accession", newOpencCREs.map((x) => x.ID).join(','), "page", String(page - 1)))
      }
      // Else it's not at the end or the last open:
      else {
        // Keep page position
        // Change URL to cCRE to the right
        router.push(basePathname + '?' + createQueryString("accession", newOpencCREs.map((x) => x.ID).join(',')))
      }
    }
    // If you're closing a tab to the left of what you're on: 
    if (closedIndex < (page - numberOfDefaultTabs)) {
      // Page count -= 1 to keep tab position
      // Remove selected cCRE from list
      setPage(page - 1)
      router.push(basePathname + '?' + createQueryString("accession", newOpencCREs.map((x) => x.ID).join(','), "page", String(page - 1)))
    }
  }

  const handlePageChange = (_, newValue: number) => {
    if(searchParams.get("gene") && (newValue===2 || newValue===3))
    {
      setOpen(false)
    }
    setPage(newValue)
    router.push(basePathname + '?' + createQueryString("page", String(newValue)))
  }

  const createQueryString = useCallback(
    (name1: string, value1: string, name2?: string, value2?: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name1, value1)
      if (name2 && value2) {
        params.set(name2, value2)
      }
      return params.toString()
    }, [searchParams]
  )

  useEffect(() => {
    setLoading(true)
    // @ts-expect-error
    //Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
    startTransition(async () => {
      //fetch rows
      setPage(searchParams.get("page") ? Number(searchParams.get("page")) : 0)
      let fetchedRows;
      if (props.mainQueryParams.bed_intersect) {
        fetchedRows = await fetchRows(props.mainQueryParams, sessionStorage.getItem("bed intersect")?.split(' '))
      } else {
        fetchedRows = await fetchRows(props.mainQueryParams)
      }
      setTableRows(fetchedRows)
      //initialize open cCREs
      const accessions = searchParams.get("accession")?.split(',')
      accessions ?
        setOpencCREs(accessions.map((id) => {
          const cCRE_info = fetchedRows.find((row) => row.accession === id)
          if (cCRE_info) {
            const region = { start: cCRE_info?.start, chrom: cCRE_info?.chromosome, end: cCRE_info?.end }
            return (
              { ID: cCRE_info.accession, region: region, linkedGenes: cCRE_info.linkedGenes }
            )
          } else {
            console.log(`Couldn't find ${id} in the table`)
            return null
          }
        }).filter((x) => x != null))
        :
        setOpencCREs([])
      setLoading(false)
    })
  }, [props.mainQueryParams, searchParams])

  const findTabByID = (id: string, numberOfTable: number = 2) => {
    return (opencCREs.findIndex((x) => x.ID === id) + numberOfTable)
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
          {/* Scroll buttons for tabs not showing up properly? */}
          <Tabs
            //Key needed to force scroll buttons to show up properly when child elements change
            key={opencCREs.length}
            sx={{
              '& .MuiTabs-scrollButtons': { color: "black" },
              '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
            }}
            allowScrollButtonsMobile
            variant="scrollable"
            aria-label="navigation tabs"
            value={page}
            onChange={handlePageChange}
          >
            {/* Hidden empty icon to keep tab height consistent */}
            <StyledTab iconPosition="end" icon={<Box sx={{ display: 'none' }} />} value={0} label="Table View" />
            {!props.mainQueryParams.bed_intersect &&
              <StyledTab value={1} label="Genome Browser View" />
            }
            {searchParams.get("gene") &&
              <StyledTab value={2} label={`${searchParams.get("gene")} Gene Expression`} />
            }
            {searchParams.get("gene") && props.mainQueryParams.assembly.toLowerCase() !== "mm10" &&
              <StyledTab value={3} label={`${searchParams.get("gene")} RAMPAGE`} />
            }


            {/* Map opencCREs to tabs */}
            {opencCREs.length > 0 && opencCREs.map((cCRE, i) => {
              return (
                <StyledTab
                  onClick={(event) => event.preventDefault} key={i} value={numberOfDefaultTabs + i}
                  label={cCRE.ID}
                  icon={
                    <Box onClick={(event) => { event.stopPropagation(); handleClosecCRE(cCRE.ID) }}>
                      <CloseIcon />
                    </Box>
                  }
                  iconPosition="end" />
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
            paddingBottom: "64px"
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        {/* Customized div to bump drawer content down */}
        <DrawerHeader>
          <Typography variant="h5" pl="0.4rem">
            {`${page < numberOfDefaultTabs ? "Refine Your Search" : "cCRE Details"}`}
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        {page < numberOfDefaultTabs ?
          //Should the filter component be refreshing the route? I think it should probably all be controlled here
          <MainResultsFilters mainQueryParams={props.mainQueryParams} byCellType={props.globals} genomeBrowserView={page === 1} accessions={opencCREs.map((x) => x.ID).join(',')} page={page} gene={searchParams.get("gene")} />
          :
          <Tabs
            aria-label="details-tabs"
            value={detailsPage}
            onChange={(_, newValue: number) => { setDetailsPage(newValue) }}
            orientation="vertical"
            variant="scrollable"
            allowScrollButtonsMobile sx={{
              '& .MuiTabs-scrollButtons': { color: "black" },
              '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
            }}>
            <StyledTab label="In Specific Biosamples" sx={{ alignSelf: "start" }} />
            <StyledTab label="Linked Genes" sx={{ alignSelf: "start" }} />
            <StyledTab label="Nearby Genomic Features" sx={{ alignSelf: "start" }} />
            <StyledTab label="TF and His-mod Intersection" sx={{ alignSelf: "start" }} />
            { /*
           //Disabling this feature (temporary)
           <StyledTab label="TF Motifs and Sequence Features" sx={{ alignSelf: "start" }} />
           */}
            <StyledTab label="Linked cCREs in other Assemblies" sx={{ alignSelf: "start" }} />

            <StyledTab label="Associated Gene Expression" sx={{ alignSelf: "start" }} />
            <StyledTab label="Functional Data" sx={{ alignSelf: "start" }} />
            <StyledTab label="TF Motifs and Sequence Features" sx={{ alignSelf: "start" }} />
            {props.mainQueryParams.assembly !== "mm10" && <StyledTab label="Associated RAMPAGE Signal" sx={{ alignSelf: "start" }} />}
          </Tabs>
        }
      </Drawer>
      <Main id="Main Content" open={open}>
        {/* Bumps content below app bar */}
        <DrawerHeader id="DrawerHeader" />
        {page === 0 && (
          <Box>
            <MainResultsTable
              rows={tableRows}
              tableTitle={
                props.mainQueryParams.bed_intersect ?
                  `Intersecting by uploaded .bed file in ${props.mainQueryParams.assembly}${sessionStorage.getItem("warning") === "true" ? " (Partial)" : ""}`
                  :
                  props.mainQueryParams.gene ?
                    `cCREs overlapping ${props.mainQueryParams.gene} - ${props.mainQueryParams.chromosome}:${props.mainQueryParams.start.toLocaleString("en-US")}-${props.mainQueryParams.end.toLocaleString("en-US")}`
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
              assembly={props.mainQueryParams.assembly}
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
        {searchParams.get("gene") && page === 2 &&
          <GeneExpression assembly={props.mainQueryParams.assembly} genes={[searchParams.get("gene")]} />
        }
        {searchParams.get("gene") && props.mainQueryParams.assembly.toLowerCase() !== "mm10" && page === 3 && (
          <Rampage gene={searchParams.get("gene")} />
        )}
        {page >= numberOfDefaultTabs && opencCREs.length > 0 && (
          <CcreDetails
            key={opencCREs[page - numberOfDefaultTabs].ID}
            accession={opencCREs[page - numberOfDefaultTabs].ID}
            region={opencCREs[page - numberOfDefaultTabs].region}
            globals={props.globals}
            assembly={props.mainQueryParams.assembly}
            genes={opencCREs[page - numberOfDefaultTabs].linkedGenes}
            page={detailsPage}
          />
        )}
      </Main>
    </Box>
  )
}
