// Search Results Page
"use client"
import { BIOSAMPLE_Data, biosampleQuery } from "../../common/lib/queries"
import { BiosampleTableFilters, FilterCriteria, MainQueryData, MainQueryParams, RegistryBiosample } from "./types"
import { constructFilterCriteriaFromURL, constructMainQueryParamsFromURL, constructSearchURL, downloadBED, fetchcCREData } from "./searchhelpers"
import React, { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { styled } from '@mui/material/styles';
import { Divider, IconButton, Tab, Tabs, Typography, Box, Button, CircularProgressProps, CircularProgress, Stack } from "@mui/material"
import { MainResultsTable } from "./mainresultstable"
import { MainResultsFilters } from "./mainresultsfilters"
import { CcreDetails, LinkedGeneInfo, } from "./_ccredetails/ccredetails"
import { usePathname, useRouter } from "next/navigation"
import { GenomeBrowserView } from "./_gbview/genomebrowserview"
import { generateFilteredRows } from "./searchhelpers"
import { Drawer } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import Rampage from "./_ccredetails/rampage";

import { GeneExpression } from "../applets/gene-expression/geneexpression";
import { LoadingMessage } from "../../common/lib/utility"
import { Download } from "@mui/icons-material"
import { ApolloQueryResult, useLazyQuery } from "@apollo/client"
import { LINKED_GENES } from "./_ccredetails/queries"
import { Browser } from "./_newgbview/browser"

/**
 * @todo:
 * - set opencCREs in nearby and orthologous
 */

const drawerWidth = 350;

const StyledHorizontalTab = styled(Tab)(() => ({
  textTransform: "none",
  paddingTop: 0,
  paddingBottom: 0,
  minHeight: "64px" //Overwrites default minHeight of 72px to constrain size
}))

const StyledVerticalTab = styled(Tab)(() => ({
  textTransform: "none",
  paddingTop: 0,
  paddingBottom: 0,
  alignSelf: "flex-start",
  minWidth: 'auto'
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

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export type LinkedGenes = {
  linkedGenes: LinkedGeneInfo[]
}

export type LinkedGenesVariables = {
  assembly: String
  accessions: String[]
  methods?: String[]
  celltypes?: String[]
}

type LinkedGenesCelltypes = {
  linkedGenesCelltypes: {
    celltype: String
    displayName: String
    method: String
  }
}

export default function Search({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const router = useRouter()
  const basePathname = usePathname()
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState<number>(searchParams.page ? +searchParams.page : 0)
  const [detailsPage, setDetailsPage] = useState(0)
  const [opencCREs, setOpencCREs] = useState<{
    ID: string,
    region: { start: number, end: number, chrom: string }
  }[]>(searchParams.accessions ? searchParams.accessions.split(',').map(x => { return { ID: x, region: null } }) : [])
  const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)
  const [mainQueryData, setMainQueryData] = useState<MainQueryData>(null)
  //potential performance improvement if I make an initializer function vs passing param here.
  const [mainQueryParams, setMainQueryParams] = useState<MainQueryParams>(constructMainQueryParamsFromURL(searchParams))
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(constructFilterCriteriaFromURL(searchParams))
  const [loadingTable, setLoadingTable] = useState<boolean>(false)
  const [loadingFetch, setLoadingFetch] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition();
  const [opencCREsInitialized, setOpencCREsInitialized] = useState(false)
  const [TSSs, setTSSs] = useState<number[]>(null)
  const [TSSranges, setTSSranges] = useState<{ start: number, end: number }[]>(null)
  const [bedLoadingPercent, setBedLoadingPercent] = useState<number>(null)


  //Used to set just biosample in filters.
  const handleSetBiosample = (biosample: RegistryBiosample) => { setMainQueryParams({ ...mainQueryParams, biosample: biosample }) }

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
  const handlecCREClick = (item) => {
    console.log(item)
    const newcCRE = { ID: item.name, region: { start: item.start, end: item.end, chrom: item.chrom } }
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


    const closedPage = opencCREs.findIndex(x => x.ID === closedID) + numberOfDefaultTabs
    if (newOpencCREs.length === 0 && closedPage === page) {
      setPage(0)
      setDetailsPage(0)
    } else if (page === opencCREs.length + numberOfDefaultTabs - 1) setPage(page - 1)
    // If you're closing the tab you're on or one to the left:
    setOpencCREs(newOpencCREs)
    //No action needed when closing a tab to the right of the page you're on
  }

  const handlePageChange = (_, newValue: number) => {
    if (mainQueryParams.gene.name && (newValue === 2 || newValue === 3)) {
      setOpen(false)
    }
    setPage(newValue)
  }

  //Keep URL and state in sync. Prevent from firing initially to allow time for opencCREs to be initialized
  //J 7/13 this really needs to be made cleaner. This is confusing to read
  /**
   * @todo this should not be done in a useEffect. This should be done in event handlers for updating relevant state variables
   */
  useEffect(() => {
    //Check if the URL params representing state are stale
    if (
      opencCREsInitialized && !loadingFetch &&
      //bug potentially?
      (JSON.stringify(constructMainQueryParamsFromURL(searchParams)) !== JSON.stringify(mainQueryParams)
        || JSON.stringify(constructFilterCriteriaFromURL(searchParams)) !== JSON.stringify(filterCriteria)
        || +searchParams.page !== page
        || searchParams.accessions !== opencCREs.map(x => x.ID).join(','))) {
      const newURL = constructSearchURL(
        mainQueryParams,
        filterCriteria,
        page,
        opencCREs.map(x => x.ID).join(',')
      )
      // console.log("old params: " +  JSON.stringify(searchParams))
      // console.log("pushing new url:" + newURL)
      router.push(newURL)
    }
  }, [searchParams, mainQueryParams, filterCriteria, page, opencCREs, router, basePathname, opencCREsInitialized, loadingFetch])

  //fetch biosample info, populate selected biosample if specified
  useEffect(() => {
    startTransition(async () => {
      const biosamples = await biosampleQuery()
      setBiosampleData(biosamples)
    })
  }, [])

  //If a biosample is selected and is missing some data (due to reload), find and attach rest of info
  useEffect(() => {
    //NOTE: lifestage is being checked here to determine if data missing. If lifestage is ever set through URL this will break
    if (mainQueryParams.biosample?.name && !mainQueryParams.biosample?.lifeStage && biosampleData?.data) {
      setMainQueryParams({
        ...mainQueryParams,
        biosample: biosampleData.data[mainQueryParams.coordinates.assembly === "GRCh38" ? "human" : "mouse"].biosamples
          .find(x => x.name === mainQueryParams.biosample.name)
      })
    }
  }, [mainQueryParams, biosampleData])


  //Fetch raw cCRE data (main query only to prevent hidden linked genes from slowing down search)
  useEffect(() => {
    // console.log("main fetch effect called")
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

    (mainQueryParams.searchConfig.bed_intersect || (start !== null) && (end !== null)) &&
      startTransition(async () => {
        const mainQueryData = await fetchcCREData(
          mainQueryParams.coordinates.assembly,
          mainQueryParams.coordinates.chromosome,
          start,
          end,
          mainQueryParams.biosample?.name ? mainQueryParams.biosample.name : undefined,
          null,
          1,
          mainQueryParams.searchConfig.bed_intersect ? sessionStorage.getItem("bed intersect")?.split(' ') : undefined
        )
        setMainQueryData(mainQueryData)
        setLoadingFetch(false)
      })
  }, [mainQueryParams.searchConfig.bed_intersect, mainQueryParams.coordinates.assembly, mainQueryParams.coordinates.chromosome, mainQueryParams.coordinates.start, mainQueryParams.coordinates.end, mainQueryParams.biosample?.name, mainQueryParams.snp.rsID, mainQueryParams.snp.distance, TSSs, TSSranges, mainQueryParams.gene.distance, mainQueryParams.gene.nearTSS])

  //Fetch Linked Genes
  const useLinkedGenes = useLazyQuery<LinkedGenes, LinkedGenesVariables>(LINKED_GENES, {
    variables: {
      assembly: mainQueryParams.coordinates.assembly.toLowerCase(),
      accessions: mainQueryData?.data.cCRESCREENSearch.map((res) => res.info.accession)
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  const [getLinkedGenes, { loading: loadingLinkedGenes, data: dataLinkedGenes, error: errorLinkedGenes }] = useLinkedGenes
  //If linked Genes Filter is set, fetch right away
  filterCriteria.linkedGeneName && mainQueryData && (!dataLinkedGenes && !loadingLinkedGenes) && getLinkedGenes()

  // Initialize open cCREs on initial load
  useEffect(() => {
    const cCREsToFetch = searchParams.accessions?.split(',')
    if (cCREsToFetch?.length > 0 && !opencCREsInitialized) {
      startTransition(async () => {
        //Generate unfiltered rows of info for each open cCRE for ease of accessing data
        const cCREQueryData = await fetchcCREData(
          mainQueryParams.coordinates.assembly,
          undefined,
          undefined,
          undefined,
          undefined,
          1000000,
          null,
          cCREsToFetch
        )
        const opencCRE_data = generateFilteredRows(
          cCREQueryData,
          [],
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
        setOpencCREsInitialized(true)
      })
    } else if ((!cCREsToFetch || cCREsToFetch?.length === 0) && !opencCREsInitialized) {
      setOpencCREsInitialized(true)
    }
  }, [opencCREsInitialized, filterCriteria, mainQueryParams.coordinates.assembly, searchParams.accessions])

  //Generate and filter rows
  const filteredTableRows = useMemo(() => {
    setLoadingTable(true)
    if (mainQueryData) {
      //remove trailing space in gene name return data. Hopefully can replace eventually, JF 7/14/24
      const rows = generateFilteredRows(mainQueryData, dataLinkedGenes ? dataLinkedGenes.linkedGenes.map((x) => { return { ...x, gene: x.gene.split(' ')[0] } }) : null, filterCriteria, false, mainQueryParams.gene.nearTSS ? TSSranges : undefined)
      setLoadingTable(false)
      return (rows)
    } else {
      return []
    }
  }, [mainQueryData, dataLinkedGenes, filterCriteria, mainQueryParams.gene.nearTSS, TSSranges])

  const findTabByID = (id: string, numberOfTable: number = 2) => {
    return (opencCREs.findIndex((x) => x.ID === id) + numberOfTable)
  }

  /**
   * @todo Make this (and other download tool) properly download new linked genes
   */
  const handleDownloadBed = () => {
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

    let assays: { dnase: boolean, atac: boolean, ctcf: boolean, h3k27ac: boolean, h3k4me3: boolean }
    if (mainQueryParams.biosample) {
      assays = {
        dnase: !!mainQueryParams.biosample.dnase,
        atac: !!mainQueryParams.biosample.atac,
        ctcf: !!mainQueryParams.biosample.ctcf,
        h3k27ac: !!mainQueryParams.biosample.h3k27ac,
        h3k4me3: !!mainQueryParams.biosample.h3k4me3
      }
    } else {
      assays = { dnase: true, atac: true, ctcf: true, h3k27ac: true, h3k4me3: true }
    }

    downloadBED(
      mainQueryParams.coordinates.assembly,
      mainQueryParams.coordinates.chromosome,
      start,
      end,
      mainQueryParams.biosample?.name,
      mainQueryParams.searchConfig.bed_intersect,
      mainQueryParams.gene.nearTSS ? TSSranges : null,
      assays,
      { primate: false, mammal: false, vertebrate: false },
      setBedLoadingPercent
    )
  }

  return (
    <>
      <Box id="Outer Box" sx={{ display: 'flex' }} component={'main'}>
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
              <StyledHorizontalTab iconPosition="end" icon={<Box sx={{ display: 'none' }} />} value={0} label="Table View" />
              {!mainQueryParams.searchConfig.bed_intersect &&
                <StyledHorizontalTab value={1} label="Genome Browser View" />
              }
              {mainQueryParams.gene.name &&
                <StyledHorizontalTab value={2}
                  label={<p><i>{mainQueryParams.gene.name}</i> Gene Expression</p>}
                />
              }
              {mainQueryParams.gene.name && mainQueryParams.coordinates.assembly.toLowerCase() !== "mm10" &&
                <StyledHorizontalTab value={3} label={<p><i>{mainQueryParams.gene.name}</i> RAMPAGE</p>} />
              }
              {/* Map opencCREs to tabs */}
              {opencCREs.length > 0 && opencCREs.map((cCRE, i) => {
                return (
                  <StyledHorizontalTab
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
            <MainResultsFilters
              mainQueryParams={mainQueryParams}
              setMainQueryParams={setMainQueryParams}
              filterCriteria={filterCriteria}
              setFilterCriteria={setFilterCriteria}
              setBiosample={(biosample) => handleSetBiosample(biosample)}
              TSSs={TSSs}
              setTSSs={setTSSs}
              setTSSranges={setTSSranges}
              genomeBrowserView={page === 1}
              useLinkedGenes={useLinkedGenes}

            />
            :
            <Tabs
              aria-label="details-tabs"
              value={detailsPage}
              onChange={(_, newValue: number) => { setDetailsPage(newValue) }}
              orientation="vertical"
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-scrollButtons': { color: "black" },
                '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <StyledVerticalTab value={0} label="Biosample Activity" />
              {mainQueryParams.coordinates.assembly !== "mm10" && <StyledVerticalTab value={1} label="Linked Genes" />}
              <StyledVerticalTab value={2} label="Nearby Genomic Features" />
              <StyledVerticalTab value={3} label="Orthologous cCREs in Other Species" />
              <StyledVerticalTab value={4} label="Associated Gene Expression" />
              {mainQueryParams.coordinates.assembly !== "mm10" && <StyledVerticalTab value={8} label="Associated Transcript Expression" />}
              <StyledVerticalTab value={5} label="Functional Data" />
              <StyledVerticalTab value={6} label="TF Motifs and Sequence Features" />
              {mainQueryParams.coordinates.assembly !== "mm10" && <StyledVerticalTab value={9} label="ChromHMM States" />}
              <StyledVerticalTab value={7} label="Configure UCSC Genome Browser" />
              {mainQueryParams.coordinates.assembly !== "mm10" && <StyledVerticalTab value={10} label="ENTEx" />}
            </Tabs>
          }
        </Drawer>
        <Main id="Main Content" open={open}>
          {/* Bumps content below app bar */}
          <DrawerHeader id="DrawerHeader" />
          {page === 0 && (
            <Box>
              {loadingTable || loadingFetch ?
                <LoadingMessage />
                :
                <><MainResultsTable
                  rows={filteredTableRows}
                  /**
                   * @todo this logic is pretty horrific, should move this into it's own function
                   */
                  tableTitle={mainQueryParams.searchConfig.bed_intersect ?
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
                        `Searching ${mainQueryParams.coordinates.chromosome} in ${mainQueryParams.coordinates.assembly} from ${mainQueryParams.coordinates.start.toLocaleString("en-US")} to ${mainQueryParams.coordinates.end.toLocaleString("en-US")}`}
                  titleHoverInfo={mainQueryParams.searchConfig.bed_intersect ?
                    `${intersectWarning.current === "true" ?
                      "The file you uploaded, " + intersectFilenames.current + ", is too large to be completely intersected. Results are incomplete."
                      :
                      intersectFilenames.current}`
                    :
                    null}
                  itemsPerPage={[10, 25, 50]}
                  assembly={mainQueryParams.coordinates.assembly}
                  onRowClick={handlecCREClick}
                  useLinkedGenes={useLinkedGenes}
                />
                  <Stack direction="row" alignItems={"center"} sx={{ mt: 1 }}>
                    <Button
                      disabled={typeof bedLoadingPercent === "number"}
                      variant="outlined"
                      sx={{ textTransform: 'none' }}
                      onClick={() => {
                        handleDownloadBed()
                      }}
                      endIcon={<Download />}
                    >
                      Download Unfiltered Search Results (.bed)
                    </Button>
                    {bedLoadingPercent !== null && <CircularProgressWithLabel value={bedLoadingPercent} />}
                  </Stack>

                </>
              }
            </Box>
          )}
          {page === 1 && (
            <Browser cCREClick={handlecCREClick} coordinates={mainQueryParams.coordinates} gene={mainQueryParams.gene.name} biosample={mainQueryParams.biosample} />
            // <GenomeBrowserView
            //   handlecCREClickInTrack={handlecCREClick}
            //   accessions={opencCREs.map(a => {

            //     return {
            //       accession: a.ID,
            //       chromosome: a.region.chrom,
            //       start: a.region.start,
            //       end: a.region.end

            //     }
            //   })}
            //   gene={mainQueryParams.gene.name}
            //   biosample={mainQueryParams.biosample?.name}
            //   biosampledisplayname={mainQueryParams.biosample?.displayname}
            //   assembly={mainQueryParams.coordinates.assembly}
            //   coordinates={{ start: mainQueryParams.coordinates.start, end: mainQueryParams.coordinates.end, chromosome: mainQueryParams.coordinates.chromosome }}
            // />
          )}
          {mainQueryParams.gene.name && page === 2 &&
            <GeneExpression assembly={mainQueryParams.coordinates.assembly} genes={[{ name: mainQueryParams.gene.name }]} />
          }
          {mainQueryParams.gene.name && mainQueryParams.coordinates.assembly.toLowerCase() !== "mm10" && page === 3 && (
            <Rampage genes={[{ name: mainQueryParams.gene.name }]} />
          )}
          {page >= numberOfDefaultTabs && opencCREs.length > 0 && (
            opencCREs[page - numberOfDefaultTabs] ?
              <CcreDetails
                key={opencCREs[page - numberOfDefaultTabs].ID}
                accession={opencCREs[page - numberOfDefaultTabs].ID}
                region={opencCREs[page - numberOfDefaultTabs].region}
                assembly={mainQueryParams.coordinates.assembly}
                page={detailsPage}
                handleOpencCRE={handlecCREClick}
              />
              :
              <LoadingMessage />
          )}
        </Main>
      </Box>
    </>
  )
}
