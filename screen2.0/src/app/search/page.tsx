// Search Results Page
"use client"
import { getGlobals } from "../../common/lib/queries"
import { BiosampleTableFilters, CellTypeData, FilterCriteria, MainQueryParams } from "./types"
import { checkTrueFalse, constructBiosampleTableFiltersFromURL, constructFilterCriteriaFromURL, constructMainQueryParamsFromURL, constructSearchURL, createQueryString, fetchcCREDataAndLinkedGenes } from "./searchhelpers"
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { styled } from '@mui/material/styles';
import { Divider, IconButton, Tab, Tabs, Typography, Box, CircularProgress } from "@mui/material"
import { MainResultsTable } from "./mainresultstable"
import { MainResultsFilters } from "./mainresultsfilters"
import { CcreDetails } from "./_ccredetails/ccredetails"
import { usePathname, useRouter } from "next/navigation"
import { GenomeBrowserView } from "./_gbview/genomebrowserview"
import { LinkedGenesData, MainResultTableRow, rawQueryData } from "./types"
import { generateFilteredRows } from "./searchhelpers"
import { Drawer } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import Rampage from "./_ccredetails/rampage";
import { GeneExpression } from "./_ccredetails/geneexpression";
import { LoadingMessage } from "../../common/lib/utility"

/**
 * @todo:
 * - set opencCREs in nearby and orthologous
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
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(searchParams.page ? Number(searchParams.page) : 0)
  const [detailsPage, setDetailsPage] = useState(0)
  const [opencCREs, setOpencCREs] = useState<{
    ID: string,
    region: { start: string, end: string, chrom: string },
    linkedGenes: LinkedGenesData
  }[]>([])
  const [globals, setGlobals] = useState<CellTypeData>(null)
  const [rawQueryData, setRawQueryData] = useState<rawQueryData>(null)
  //potential performance improvement if I make an initializer function vs passing param here.
  const [mainQueryParams, setMainQueryParams] = useState<MainQueryParams>(constructMainQueryParamsFromURL(searchParams))
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(constructFilterCriteriaFromURL(searchParams))
  const [biosampleTableFilters, setBiosampleTableFilters] = useState<BiosampleTableFilters>(constructBiosampleTableFiltersFromURL(searchParams))
  const [loadingTable, setLoadingTable] = useState<boolean>(false)
  const [loadingFetch, setLoadingFetch] = useState<boolean>(false)
  const [opencCREsInitialized, setOpencCREsInitialized] = useState(false)
  const [TSSs, setTSSs] = useState<number[]>(null)
  const [TSSranges, setTSSranges] = useState<{start: number, end: number}[]>(null)

  //Used to set just biosample in filters. Used for performance improvement to avoid having entire mainQueryParams in dep array
  const handleSetBiosample = (
    biosample: {
      selected: boolean
      biosample: string
      tissue: string
      summaryName: string
    }) => {
    setMainQueryParams({ ...mainQueryParams, biosample: biosample })
  }

  //using useRef, and then assigning their value in useEffect to prevent accessing sessionStorage on the server
  const intersectWarning = useRef(null);
  const intersectFilenames = useRef(null)

  useEffect(() => {
    intersectWarning.current = sessionStorage.getItem("warning")
    intersectFilenames.current = sessionStorage.getItem("filenames")
  }, [])

  const numberOfDefaultTabs = mainQueryParams.gene.name ? (mainQueryParams.coordinates.assembly.toLowerCase() === "mm10" ? 3 : 4) : 2

  const handleDrawerOpen = () => { setOpen(true) }
  const handleDrawerClose = () => { setOpen(false) }

  //Handle opening a cCRE or navigating to its open tab
  const handleTableClick = (row: MainResultTableRow) => {
    const newcCRE = { ID: row.accession, region: { start: row.start, end: row.end, chrom: row.chromosome }, linkedGenes: row.linkedGenes }
    //If cCRE isn't in open cCREs, add and push as current accession.
    if (!opencCREs.find((x) => x.ID === newcCRE.ID)) {
      setOpencCREs([...opencCREs, newcCRE])
      setPage(opencCREs.length + numberOfDefaultTabs)
    } else {
      setPage(findTabByID(newcCRE.ID, numberOfDefaultTabs))
    }
  }

  //Handle closing cCRE, and changing page if needed
  const handleClosecCRE = (closedID: string) => {
    const newOpencCREs = opencCREs.filter((cCRE) => cCRE.ID != closedID)
    setOpencCREs(newOpencCREs)

    const closedIndex = opencCREs.findIndex(x => x.ID === closedID)
    // If you're closing the tab you're on or one to the left:
    if (closedIndex <= (page - numberOfDefaultTabs)) {
      if (newOpencCREs.length === 0) {
        setPage(0)
        setDetailsPage(0)
      }
      else setPage(page - 1)
    }
    //No action needed when closing a tab to the right of the page you're on
  }

  const handlePageChange = (_, newValue: number) => {
    if (mainQueryParams.gene.name && (newValue === 2 || newValue === 3)) {
      setOpen(false)
    }
    setPage(newValue)
  }

  //Keep URL and state in sync. Prevent from firing initially to allow time for opencCREs to be initialized
  useEffect(() => {
    //Check if the URL params representing state are stale
    if (
      opencCREsInitialized &&
      JSON.stringify(constructMainQueryParamsFromURL(searchParams)) !== JSON.stringify(mainQueryParams)
      || JSON.stringify(constructFilterCriteriaFromURL(searchParams)) !== JSON.stringify(filterCriteria)
      || JSON.stringify(constructBiosampleTableFiltersFromURL(searchParams)) !== JSON.stringify(biosampleTableFilters)
      || +searchParams.page !== page
      || searchParams.accessions !== opencCREs.map(x => x.ID).join(','))
     {
      const newURL = constructSearchURL(
        mainQueryParams,
        filterCriteria,
        biosampleTableFilters,
        page,
        opencCREs.map(x => x.ID).join(',')
      )
      router.push(newURL)
    }
  }, [searchParams, mainQueryParams, filterCriteria, biosampleTableFilters, page, opencCREs, router, basePathname, opencCREsInitialized])

  //fetch globals
  useEffect(() => {
    // Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
    // @ts-expect-error
    startTransition(async () => {
      console.log("fetching globals")
      setGlobals(await getGlobals(mainQueryParams.coordinates.assembly))
    })
  }, [mainQueryParams.coordinates.assembly])


  //Fetch raw cCRE data (main query and linked genes)
  useEffect(() => {
      setLoadingFetch(true)

      let start = mainQueryParams.coordinates.start
      if (mainQueryParams.snp.rsID) {
        start = Math.max(0, mainQueryParams.coordinates.start - mainQueryParams.snp.distance);
      } else if (mainQueryParams.gene.nearTSS) {
        start = TSSs && TSSranges ? Math.max(0, Math.min(...TSSs) - mainQueryParams.gene.distance) : null
      }

      let end = mainQueryParams.coordinates.end
      if (mainQueryParams.snp.rsID) {
        end = mainQueryParams.coordinates.end + mainQueryParams.snp.distance;
      } else if (mainQueryParams.gene.nearTSS) {
        end = TSSs && TSSranges ? Math.max(...TSSs) + mainQueryParams.gene.distance : null
      }

      // Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
      // @ts-expect-error
      start && end && startTransition(async () => {
        console.log("sending query for " + mainQueryParams.coordinates.assembly)
        setRawQueryData(
          await fetchcCREDataAndLinkedGenes(
            mainQueryParams.coordinates.assembly,
            mainQueryParams.coordinates.chromosome,
            start,
            end,
            mainQueryParams.biosample.biosample,
            1000000,
            null,
            mainQueryParams.searchConfig.bed_intersect ? sessionStorage.getItem("bed intersect")?.split(' ') : undefined
          )
        )
        console.log("query complete for " + mainQueryParams.coordinates.assembly)
        setLoadingFetch(false)
      })
  }, [mainQueryParams.searchConfig.bed_intersect, mainQueryParams.coordinates.assembly, mainQueryParams.coordinates.chromosome, mainQueryParams.coordinates.start, mainQueryParams.coordinates.end, mainQueryParams.biosample.biosample, mainQueryParams.snp.rsID, mainQueryParams.snp.distance, TSSs, TSSranges, mainQueryParams.gene.distance, mainQueryParams.gene.nearTSS])

  // Initialize open cCREs on initial load
  useEffect(() => {
    const cCREsToFetch = searchParams.accessions?.split(',')
    if (cCREsToFetch && !opencCREsInitialized) {
      // @ts-expect-error
      startTransition(async () => {
        console.log("initialize cCRE effect running")
        //Generate unfiltered rows of info for each open cCRE for ease of accessing data
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
          filterCriteria,
          true
        )
        const newOpencCREs = [...opencCRE_data.map((cCRE) => {
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
          const indexA = cCREsToFetch.indexOf(a.ID);
          const indexB = cCREsToFetch.indexOf(b.ID);
          return indexA - indexB;
        })
        )
      })
      setOpencCREsInitialized(true)
    } 
  }, [opencCREsInitialized, filterCriteria, mainQueryParams.coordinates.assembly, searchParams.accessions])

  /**
   * TODO ADD TSS ranges to filter function
   */

  //Generate and filter rows
  const filteredTableRows = useMemo(() => {
    setLoadingTable(true)
    if (rawQueryData) {
      const rows = generateFilteredRows(rawQueryData, filterCriteria, false, mainQueryParams.gene.nearTSS ? TSSranges : undefined)
      setLoadingTable(false)
      return (rows)
    } else {
      return []
    }
  }, [rawQueryData, filterCriteria, TSSranges])

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
              {mainQueryParams.gene.name &&
                <StyledTab value={2} label={`${mainQueryParams.gene.name} Gene Expression`} />
              }
              {mainQueryParams.gene.name && mainQueryParams.coordinates.assembly.toLowerCase() !== "mm10" &&
                <StyledTab value={3} label={`${mainQueryParams.gene.name} RAMPAGE`} />
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
            <MainResultsFilters
              mainQueryParams={mainQueryParams}
              setMainQueryParams={setMainQueryParams}
              filterCriteria={filterCriteria}
              setFilterCriteria={setFilterCriteria}
              biosampleTableFilters={biosampleTableFilters}
              setBiosampleTableFilters={setBiosampleTableFilters}
              setBiosample={(biosample) => handleSetBiosample(biosample)}
              TSSs={TSSs}
              setTSSs={setTSSs}
              setTSSranges={setTSSranges}
              byCellType={globals}
              genomeBrowserView={page === 1}
              searchParams={searchParams}
            />
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
            //The issue is that it get's stuck on loadingcCREs = true on reload
            <Box>
              {loadingTable || loadingFetch ?
                <LoadingMessage />
                :
                <MainResultsTable
                  rows={filteredTableRows}
                  tableTitle={
                    mainQueryParams.searchConfig.bed_intersect ?
                      `Intersecting by uploaded .bed file in ${mainQueryParams.coordinates.assembly}${intersectWarning.current === "true" ? " (Partial)" : ""}`
                      :
                      mainQueryParams.gene.name ?
                        mainQueryParams.gene.nearTSS ?
                          `cCREs within ${mainQueryParams.gene.distance / 1000}kb of TSSs of ${mainQueryParams.gene.name} - ${mainQueryParams.coordinates.chromosome}:${mainQueryParams.coordinates.start.toLocaleString("en-US")}-${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                          :
                          `cCREs overlapping ${mainQueryParams.gene.name} - ${mainQueryParams.coordinates.chromosome}:${mainQueryParams.coordinates.start.toLocaleString("en-US")}-${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                        :
                        mainQueryParams.snp.rsID ?
                          `cCREs within ${mainQueryParams.snp.distance}bp of ${mainQueryParams.snp.rsID} - ${mainQueryParams.coordinates.chromosome}:${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                          :
                          `Searching ${mainQueryParams.coordinates.chromosome} in ${mainQueryParams.coordinates.assembly} from ${mainQueryParams.coordinates.start.toLocaleString("en-US")} to ${mainQueryParams.coordinates.end.toLocaleString("en-US")}`
                  }
                  titleHoverInfo={mainQueryParams.searchConfig.bed_intersect ?
                    `${intersectWarning.current === "true" ?
                      "The file you uploaded, " + intersectFilenames.current + ", is too large to be completely intersected. Results are incomplete."
                      :
                      intersectFilenames.current}`
                    :
                    null
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
              gene={mainQueryParams.gene.name}
              biosample={mainQueryParams.biosample.biosample}
              assembly={mainQueryParams.coordinates.assembly}
              coordinates={{ start: mainQueryParams.coordinates.start, end: mainQueryParams.coordinates.end, chromosome: mainQueryParams.coordinates.chromosome }}
            />
          )}
          {mainQueryParams.gene.name && page === 2 &&
            <GeneExpression assembly={mainQueryParams.coordinates.assembly} genes={[mainQueryParams.gene.name]} />
          }
          {mainQueryParams.gene.name && mainQueryParams.coordinates.assembly.toLowerCase() !== "mm10" && page === 3 && (
            <Rampage gene={mainQueryParams.gene.name} />
          )}
          {page >= numberOfDefaultTabs && opencCREs.length > 0 && (
            opencCREs[page - numberOfDefaultTabs] ?
            <CcreDetails
              key={opencCREs[page - numberOfDefaultTabs].ID}
              accession={opencCREs[page - numberOfDefaultTabs].ID}
              region={opencCREs[page - numberOfDefaultTabs].region}
              globals={globals}
              assembly={mainQueryParams.coordinates.assembly}
              genes={opencCREs[page - numberOfDefaultTabs].linkedGenes}
              page={detailsPage}
            />
            :
            <LoadingMessage/>
          )}
        </Main>
      </Box>
    </main>
  )
}
