// Search Results Page
"use client"
import { getGlobals } from "../../common/lib/queries"
import { CellTypeData, MainQueryParams } from "./types"
import { constructMainQueryParamsFromURL, createQueryString, fetchcCREDataAndLinkedGenes } from "./search-helpers"
import React, { startTransition, useCallback, useEffect, useMemo, useState } from "react"
import { styled } from '@mui/material/styles';
import { Divider, IconButton, Tab, Tabs, Typography, Box, CircularProgress } from "@mui/material"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilters from "../../common/components/MainResultsFilters"
import { CcreDetails } from "./ccredetails/ccredetails"
import { usePathname, useRouter } from "next/navigation"
import { GenomeBrowserView } from "./gbview/genomebrowserview"
import { LinkedGenesData, MainResultTableRow, rawQueryData } from "./types"
import { generateFilteredRows } from "./search-helpers"
import { Drawer } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import Rampage from "./ccredetails/rampage";
import { GeneExpression } from "./ccredetails/geneexpression";
import { LoadingMessage } from "../../common/lib/utility"

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

export default function Search({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const router = useRouter()
  const basePathname = usePathname()
  const [open, setOpen] = React.useState(true);
  const [page, setPage] = useState(searchParams.page ? Number(searchParams.page) : 0)
  const [detailsPage, setDetailsPage] = useState(0)
  const [opencCREs, setOpencCREs] = useState<{
    ID: string,
    region: { start: string, end: string, chrom: string },
    linkedGenes: LinkedGenesData
  }[]>([])
  const [globals, setGlobals] = useState<CellTypeData>(null)
  const [rawQueryData, setRawQueryData] = useState<rawQueryData>(null)
  const [mainQueryParams, setMainQueryParams] = useState<MainQueryParams>(constructMainQueryParamsFromURL(searchParams))
  const [loadingcCREs, setLoadingcCREs] = useState<boolean>(true)

  const numberOfDefaultTabs = searchParams.gene ? (mainQueryParams.coordinates.assembly.toLowerCase() === "mm10" ? 3 : 4) : 2

  const handleDrawerOpen = () => { setOpen(true) }
  const handleDrawerClose = () => { setOpen(false) }

  const handleTableClick = (row: MainResultTableRow) => {
    const newcCRE = { ID: row.accession, region: { start: row.start, end: row.end, chrom: row.chromosome }, linkedGenes: row.linkedGenes }
    //If cCRE isn't in open cCREs, add and push as current accession.
    if (!opencCREs.find((x) => x.ID === newcCRE.ID)) {
      setOpencCREs([...opencCREs, newcCRE])
      setPage(opencCREs.length + numberOfDefaultTabs)
      router.push(basePathname + "?" + createQueryString(searchParams, "accession", [...opencCREs, newcCRE].map((x) => x.ID).join(','), "page", String(opencCREs.length + numberOfDefaultTabs)))
    } else {
      const newPage = findTabByID(newcCRE.ID, numberOfDefaultTabs)
      setPage(newPage)
      router.push(basePathname + "?" + createQueryString(searchParams, "page", String(newPage)))
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
      router.push(basePathname + '?' + createQueryString(searchParams, "accession", newOpencCREs.map((x) => x.ID).join(',')))
    }
    // If you're closing the tab you're on:
    if (closedIndex === (page - numberOfDefaultTabs)) {
      // If it is the last open:
      if (opencCREs.length === 1) {
        // Set to page 0
        setPage(0)
        setDetailsPage(0)
        // Change URL to ???
        router.push(basePathname + '?' + createQueryString(searchParams, "accession", "", "page", "0"))
      }
      // If it's the tab at the far right
      else if (page === (opencCREs.length + (numberOfDefaultTabs - 1))) {
        // Page - 1
        setPage(page - 1)
        // URL to accession on the left
        router.push(basePathname + '?' + createQueryString(searchParams, "accession", newOpencCREs.map((x) => x.ID).join(','), "page", String(page - 1)))
      }
      // Else it's not at the end or the last open:
      else {
        // Keep page position
        // Change URL to cCRE to the right
        router.push(basePathname + '?' + createQueryString(searchParams, "accession", newOpencCREs.map((x) => x.ID).join(',')))
      }
    }
    // If you're closing a tab to the left of what you're on: 
    if (closedIndex < (page - numberOfDefaultTabs)) {
      // Page count -= 1 to keep tab position
      // Remove selected cCRE from list
      setPage(page - 1)
      router.push(basePathname + '?' + createQueryString(searchParams, "accession", newOpencCREs.map((x) => x.ID).join(','), "page", String(page - 1)))
    }
  }

  const handlePageChange = (_, newValue: number) => {
    if (searchParams.gene && (newValue === 2 || newValue === 3)) {
      setOpen(false)
    }
    setPage(newValue)
    router.push(basePathname + '?' + createQueryString(searchParams, "page", String(newValue)))
  }

  //It's maybe not great to use useEffect liberally like this: https://react.dev/learn/you-might-not-need-an-effect
  //Doing this to be able to use startTransition to invoke server action

  //Fetch byCellType
  useEffect(() => {
    // Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
    // @ts-expect-error
    startTransition(async () => {
      setGlobals(await getGlobals(mainQueryParams.coordinates.assembly))
    })
  }, [mainQueryParams.coordinates.assembly])

  //Fetch raw cCRE data (main query and linked genes)
  useEffect(() => {
    setLoadingcCREs(true)
    // Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
    // @ts-expect-error
    startTransition(async () => {
      setRawQueryData(
        await fetchcCREDataAndLinkedGenes(
          mainQueryParams.coordinates.assembly,
          mainQueryParams.coordinates.chromosome,
          mainQueryParams.coordinates.start,
          mainQueryParams.coordinates.end,
          mainQueryParams.biosample.biosample,
          1000000,
          null,
          mainQueryParams.searchConfig.bed_intersect ? sessionStorage.getItem("bed intersect")?.split(' ') : undefined
        )
      )
    })
  }, [mainQueryParams.searchConfig.bed_intersect, mainQueryParams.coordinates.assembly, mainQueryParams.coordinates.chromosome, mainQueryParams.coordinates.start, mainQueryParams.coordinates.end, mainQueryParams.biosample.biosample])

  //Generate and filter rows
  const filteredTableRows = useMemo(() => {
    if (rawQueryData) {
      setLoadingcCREs(true)
      const rows = generateFilteredRows(rawQueryData, mainQueryParams.filterCriteria)
      setLoadingcCREs(false)
      return (rows)
    } else return []
  }, [rawQueryData, mainQueryParams.filterCriteria])

  //Refresh mainQueryParams if route updates, either from filters panel or header search
  //This almost certainly runs more than I want, but not bad performance impact
  useEffect(() => {
    setMainQueryParams(constructMainQueryParamsFromURL(searchParams))
  }, [searchParams])

  //Initialize opencCREs on first load
  useEffect(() => {
    const cCREsToFetch = searchParams.accession && searchParams.accession.split(',').filter((cCRE) => (opencCREs.find((x) => cCRE === x.ID) === undefined))
    //If there are cCREs to fetch...
    // @ts-expect-error
    cCREsToFetch?.length > 0 && startTransition(async () => {
      //Generate unfiltered rows of info for each open cCRE for ease of accessing data
      const accessionOrder = searchParams.accession?.split(',')
      console.log("fetching info on" + cCREsToFetch)
      const opencCRE_data = generateFilteredRows(
        await fetchcCREDataAndLinkedGenes(
          mainQueryParams.coordinates.assembly,
          undefined,
          undefined,
          undefined,
          undefined,
          1000000,
          null,
          cCREsToFetch
        ),
        mainQueryParams.filterCriteria,
        true
      )
      const newOpencCREs = [...opencCREs, ...opencCRE_data.map((cCRE) => {
        return (
          {
            ID: cCRE.accession,
            region: {
              start: cCRE.start,
              end: cCRE.end,
              chrom: cCRE.chromosome,
            },
            linkedGenes: cCRE.linkedGenes
          }
        )
      })]
      //sort to match url order
      setOpencCREs(newOpencCREs.sort((a, b) => {
          const indexA = accessionOrder.indexOf(a.ID);
          const indexB = accessionOrder.indexOf(b.ID);
          return indexA - indexB;
        })
      )
    })
  }, [searchParams.accession])

  const findTabByID = (id: string, numberOfTable: number = 2) => {
    return (opencCREs.findIndex((x) => x.ID === id) + numberOfTable)
  }


  return (
    <main>
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
              {!mainQueryParams.searchConfig.bed_intersect &&
                <StyledTab value={1} label="Genome Browser View" />
              }
              {mainQueryParams.searchConfig.gene &&
                <StyledTab value={2} label={`${mainQueryParams.searchConfig.gene} Gene Expression`} />
              }
              {mainQueryParams.searchConfig.gene && mainQueryParams.coordinates.assembly.toLowerCase() !== "mm10" &&
                <StyledTab value={3} label={`${mainQueryParams.searchConfig.gene} RAMPAGE`} />
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
            <MainResultsFilters mainQueryParams={mainQueryParams} byCellType={globals} genomeBrowserView={page === 1} accessions={opencCREs.map((x) => x.ID).join(',')} page={page} />
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
              <StyledTab label="Linked cCREs in other Assemblies" sx={{ alignSelf: "start" }} />
              <StyledTab label="Associated Gene Expression" sx={{ alignSelf: "start" }} />
              <StyledTab label="Functional Data" sx={{ alignSelf: "start" }} />
              <StyledTab label="TF Motifs and Sequence Features" sx={{ alignSelf: "start" }} />
              {mainQueryParams.coordinates.assembly !== "mm10" && <StyledTab label="Associated RAMPAGE Signal" sx={{ alignSelf: "start" }} />}
            </Tabs>
          }
        </Drawer>
        <Main id="Main Content" open={open}>
          {/* Bumps content below app bar */}
          <DrawerHeader id="DrawerHeader" />
          {page === 0 && (
            <Box>
              {loadingcCREs ?
                <LoadingMessage />
                :
                <MainResultsTable
                  rows={filteredTableRows}
                  tableTitle={
                    mainQueryParams.searchConfig.bed_intersect ?
                      `Intersecting by uploaded .bed file in ${mainQueryParams.coordinates.assembly}${sessionStorage.getItem("warning") === "true" ? " (Partial)" : ""}`
                      :
                      mainQueryParams.searchConfig.gene ?
                        `cCREs overlapping ${mainQueryParams.searchConfig.gene} - ${mainQueryParams.coordinates.chromosome}:${mainQueryParams.coordinates.start.toLocaleString("en-US")}-${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                        :
                        mainQueryParams.searchConfig.snpid ?
                          `cCREs overlapping ${mainQueryParams.searchConfig.snpid} - ${mainQueryParams.coordinates.chromosome}:${mainQueryParams.coordinates.start.toLocaleString("en-US")}-${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                          :
                          `Searching ${mainQueryParams.coordinates.chromosome} in ${mainQueryParams.coordinates.assembly} from ${mainQueryParams.coordinates.start.toLocaleString("en-US")} to ${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                  }
                  titleHoverInfo={mainQueryParams.searchConfig.bed_intersect ?
                    `${sessionStorage.getItem("warning") === "true" ? "The file you uploaded, " + sessionStorage.getItem('filenames') + ", is too large to be completely intersected. Results are incomplete."
                      :
                      sessionStorage.getItem('filenames')}` : null
                  }
                  itemsPerPage={10}
                  assembly={mainQueryParams.coordinates.assembly}
                  onRowClick={handleTableClick}
                />
              }
            </Box>
          )}
          {page === 1 && (
            <GenomeBrowserView
              gene={mainQueryParams.searchConfig.gene}
              biosample={mainQueryParams.biosample.biosample}
              assembly={mainQueryParams.coordinates.assembly}
              coordinates={{ start: mainQueryParams.coordinates.start, end: mainQueryParams.coordinates.end, chromosome: mainQueryParams.coordinates.chromosome }}
            />
          )}
          {mainQueryParams.searchConfig.gene && page === 2 &&
            <GeneExpression assembly={mainQueryParams.coordinates.assembly} genes={[mainQueryParams.searchConfig.gene]} />
          }
          {mainQueryParams.searchConfig.gene && mainQueryParams.coordinates.assembly.toLowerCase() !== "mm10" && page === 3 && (
            <Rampage gene={mainQueryParams.searchConfig.gene} />
          )}
          {page >= numberOfDefaultTabs && opencCREs.length > 0 && (
            <CcreDetails
              key={opencCREs[page - numberOfDefaultTabs].ID}
              accession={opencCREs[page - numberOfDefaultTabs].ID}
              region={opencCREs[page - numberOfDefaultTabs].region}
              globals={globals}
              assembly={mainQueryParams.coordinates.assembly}
              genes={opencCREs[page - numberOfDefaultTabs].linkedGenes}
              page={detailsPage}
            />
          )}
        </Main>
      </Box>
    </main>
  )
}
