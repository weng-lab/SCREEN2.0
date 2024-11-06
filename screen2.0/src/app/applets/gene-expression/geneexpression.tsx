"use client"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { LoadingMessage } from "../../../common/lib/utility"
import { useQuery } from "@apollo/client"
import { Button, Typography, Stack, MenuItem, FormControl, InputLabel, OutlinedInput, Select, ToggleButton, ToggleButtonGroup, FormLabel, Tooltip, IconButton, Divider } from "@mui/material"
import Grid from "@mui/material/Grid2"
import Image from "next/image"
import { humanTissues, mouseTissues } from "./const"
import { GENE_EXP_QUERY, GENE_QUERY, GET_ORTHOLOG, GET_ORTHOLOG_DATA, GET_ORTHOLOG_VARS } from "./queries"
import { ReadonlyURLSearchParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import ConfigureGBModal from "../../search/_ccredetails/configuregbmodal"
import { GeneAutocomplete } from "../../search/_geneAutocomplete/GeneAutocomplete"
import { GeneInfo } from "../../search/_geneAutocomplete/types"
import { Close, Download, OpenInNew, Search, SyncAlt } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import DownloadDialog, { FileOption } from "../gwas/_lollipop-plot/DownloadDialog"
import { capitalizeFirstLetter, downloadObjArrayAsTSV, downloadSVG, downloadSvgAsPng } from "../gwas/helpers"
import VerticalBarPlot, { BarData } from "../../_barPlot/BarPlot"
import { tissueColors } from "../../../common/lib/colors"
import MultiSelect, { MultiSelectOnChange } from "./MultiSelect"

const biosampleTypes = ["cell line", "primary cell", "tissue", "in vitro differentiated cells" ];

type Assembly = "GRCh38" | "mm10"

const initialTissues = (assembly: Assembly) => {
  if (assembly === "GRCh38") {
    return humanTissues
  } else {
    return mouseTissues
  }
}

//extracted from generated types, needed the nested type to pass as type argument to BarData<T>
type GeneDataset = { __typename?: 'GeneDataset', biosample: string, tissue?: string | null, cell_compartment?: string | null, biosample_type?: string | null, assay_term_name?: string | null, accession: string, gene_quantification_files?: Array<{ __typename?: 'GeneQuantificationFile', accession: string, biorep?: number | null, quantifications?: Array<{ __typename?: 'GeneQuantification', tpm: number, file_accession: string } | null> | null } | null> | null }

export function GeneExpression(props: {
  assembly: Assembly
  genes?: { name: string, linkedBy?: string[] }[]
  applet?: boolean
}) {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const urlAssembly = searchParams.get("assembly")
  const initialAssembly = ((urlAssembly === "GRCh38") || (urlAssembly === "mm10")) ? urlAssembly : props.assembly
  const urlGene = searchParams.get("gene")
  const router = useRouter()
  const pathname = usePathname()

  //If genes passed as prop, use those. This is case in cCRE Details. Else use url gene if passed, default to APOE
  const [gene, setGene] = useState<string>(props.genes ? props?.genes[0]?.name : (urlGene ?? "APOE"))
  const [assembly, setAssembly] = useState<Assembly>(initialAssembly)
  const [biosamples, setBiosamples] = useState<string[]>(biosampleTypes)
  const [tissues, setTissues] = useState<string[]>(() => initialTissues(initialAssembly))
  const [viewBy, setViewBy] = useState<"byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM">("byExperimentTPM")
  const [RNAtype, setRNAType] = useState<"all" | "polyA plus RNA-seq" | "total RNA-seq">("total RNA-seq")
  const [scale, setScale] = useState<"linearTPM" | "logTPM">("linearTPM")
  const [replicates, setReplicates] = useState<"mean" | "all">("mean")
  const [configGBopen, setConfigGBOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [search, setSearch] = useState<string>("")

  const plotRef = useRef<SVGSVGElement>()

  const handleOpenConfigGB = () => {
    if (gene) setConfigGBOpen(true)
  }

  const handleSetSearch = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearch(event.target.value)
  };

  const sampleMatchesSearch = useCallback((x: GeneDataset): boolean => {
    if (search) {
      return x.accession.toLowerCase().includes(search.toLowerCase())
        || x.biosample.toLowerCase().includes(search.toLowerCase())
        || x.tissue.toLowerCase().includes(search.toLowerCase())
        || !!x.gene_quantification_files.map(x => x.accession).find(y => y.toLowerCase().includes(search.toLowerCase()))
    } else return true
  }, [search])

  //Fetch Gene info to get ID
  //This query seems like it shouldn't be necessary, but ID needed in second query
  //and component isn't setup to take in ID as prop so leaving as-is. -Jonathan 7/25/24
  //Gene autocomplete exposes ID, which makes this avoidable aside from initial load.
  const {
    data: dataGeneID,
    loading: loadingGeneID
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: assembly.toLowerCase(),
      name: [gene],
      version: assembly === "GRCh38" ? 40 : 25
    },
    skip: !gene,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  //Fetch Gene Exp data
  const {
    data: dataExperiments,
    loading: loadingExperiments
  } = useQuery(GENE_EXP_QUERY, {
    variables: {
      assembly: assembly,
      gene_id: dataGeneID && dataGeneID.gene.length > 0 && dataGeneID.gene[0].id.split(".")[0]
    },
    skip: !gene || !dataGeneID || (dataGeneID && dataGeneID.gene.length === 0),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  const { data: dataOrtholog, loading: loadingOrtholog, error: errorOrtholog } = useQuery<GET_ORTHOLOG_DATA, GET_ORTHOLOG_VARS>(GET_ORTHOLOG, {
    variables: {
      name: [gene],
      assembly: assembly.toLowerCase() as "mm10" | "grch38"
    },
    skip: !gene
  })

  const makeLabel = (tpm: number, biosample: string, accession: string, biorep?: number): string => {
    return `${tpm.toFixed(2)}, ${biosample.length > 25 ? biosample.slice(0, 23) + '...' : biosample} (${accession}${biorep ? ', rep. ' + biorep : ''})`
  }

  const scaleData = useCallback((value: number) => {
    switch (scale) {
      case ("linearTPM"): return value;
      case ("logTPM"): return Math.log10(value + 1)
    }
  }, [scale])

  
  const plotData: BarData<GeneDataset>[] = useMemo(() => {
    if (dataExperiments && dataExperiments.gene_dataset.length > 0) {
      //Filter data points
      const filteredData = dataExperiments.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type)) //biosample type
        .filter(d => tissues.includes(d.tissue)) //tissue
        .filter(d => RNAtype === "all" || d.assay_term_name === RNAtype) //RNA type
        .filter(d => sampleMatchesSearch(d)) //search
      //holder for plot data as replicates are parsed for each experiment
      let parsedReplicates: BarData<GeneDataset>[] = []
      filteredData.forEach((biosample) => {
        if (replicates === "all") { //push all replicates
          biosample.gene_quantification_files.forEach((exp) => {      
            parsedReplicates.push({
              category: biosample.tissue,
              label: makeLabel(scaleData(exp.quantifications[0].tpm), biosample.biosample, biosample.accession, exp.biorep),
              value: scaleData(exp.quantifications[0].tpm), //indexing into 0th position, only one gene so quantifications should always be length 1
              color: tissueColors[biosample.tissue] ?? tissueColors.missing,
              metadata: biosample as GeneDataset
            })
          })
        } else { //average replicates
          let sum = 0
          biosample.gene_quantification_files.forEach((exp) => {
            sum += (exp.quantifications[0].tpm) //using reduce had terrible readability so doing avg manually
          })
          const avgTPM = sum / biosample.gene_quantification_files.length
          parsedReplicates.push({
            category: biosample.tissue,
            label: makeLabel(scaleData(avgTPM), biosample.biosample, biosample.accession), //omit biorep
            value: scaleData(avgTPM),
            color: tissueColors[biosample.tissue] ?? tissueColors.missing,
            metadata: biosample as GeneDataset
          })
        }
      })
      switch (viewBy) {
        case ("byExperimentTPM"):{
          //sort by value
          parsedReplicates.sort((a, b) => b.value - a.value);
          break;
        }
        case ("byTissueTPM"): {
          //find max value for each tissue
          const maxValuesByTissue: {[key: string]: number} = parsedReplicates.reduce((acc, item) => {
            acc[item.category] = Math.max(acc[item.category] || -Infinity, item.value);
            return acc;
          }, {});

          //sort by max value for tissue, and sort within the tissue itself
          parsedReplicates.sort((a, b) => {
            const maxDiff = maxValuesByTissue[b.category] - maxValuesByTissue[a.category];
            return maxDiff !== 0 ? maxDiff : b.value - a.value;
          });
          break;
        }
        case ("byTissueMaxTPM"): {
          //find max value for each tissue
          const maxValuesByTissue: {[key: string]: number} = parsedReplicates.reduce((acc, item) => {
            acc[item.category] = Math.max(acc[item.category] || -Infinity, item.value);
            return acc;
          }, {});

          //filter out all but max value for each tissue, then sort descending
          parsedReplicates = parsedReplicates.filter(x => x.value === maxValuesByTissue[x.category])
          parsedReplicates.sort((a, b) => b.value - a.value);
        }
      }
      return parsedReplicates
    } else return []
  }, [RNAtype, biosamples, dataExperiments, replicates, sampleMatchesSearch, scaleData, tissues, viewBy])

  const handleSetAssembly = (newAssembly: Assembly) => {
    if (props.applet) { //only allow switch in applet. Check should never fail but keeping
      setAssembly(newAssembly)
      if (newAssembly === "GRCh38") {
        setTissues(humanTissues) //Reset Tissue Filter
        setRNAType("total RNA-seq") //Switch back RNA type if going from mouse to human, as all data there is total
      } else {
        setTissues(mouseTissues) //Reset Tissue Filter
      }
    }
  }

  const handleGroupChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: string | null,
  ) => {
    if ((newView !== null) && ((newView === "byTissueMaxTPM") || (newView === "byExperimentTPM") || (newView === "byTissueTPM"))) {
      setViewBy(newView)
    }
  };

  const handleRNATypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRNA: string | null,
  ) => {
    if ((newRNA !== null) && ((newRNA === "all") || (newRNA === "polyA plus RNA-seq") || (newRNA === "total RNA-seq"))) {
      setRNAType(newRNA)
    }
  };

  const handleScaleChange = (
    event: React.MouseEvent<HTMLElement>,
    newScale: string | null,
  ) => {
    if ((newScale !== null) && ((newScale === "linearTPM") || (newScale === "logTPM"))) {
      setScale(newScale)
    }
  };

  const handleReplicatesChange = (
    event: React.MouseEvent<HTMLElement>,
    newReplicates: string | null,
  ) => {
    if ((newReplicates !== null) && ((newReplicates === "mean") || (newReplicates === "all"))) {
      setReplicates(newReplicates)
    }
  };
  
  const handleDownload = useCallback((selectedOptions: FileOption[]) => {
    if (selectedOptions.includes('svg')) { downloadSVG(plotRef, gene + '_gene_expression') }
    if (selectedOptions.includes('png')) { downloadSvgAsPng(plotRef, gene + '_gene_expression') }
    if (selectedOptions.includes('tsv')) {
      const toDownload: { accession: string, biosample: string, tissue: string, tpm: string }[] = [...dataExperiments.gene_dataset]
        .map(x => {
          return {
            accession: x.accession,
            biosample: x.biosample,
            tissue: x.tissue,
            tpm: (x.gene_quantification_files.reduce((acc, cur) => acc + cur.quantifications?.[0]?.tpm, 0) / x.gene_quantification_files.length).toFixed(2)
          }
        })
        .sort((a, b) => a.accession.localeCompare(b.accession))
      downloadObjArrayAsTSV(toDownload, gene + '_gene_expression')
    }
  }, [dataExperiments?.gene_dataset, gene])

  const PlotTooltip = useCallback((bar: BarData<GeneDataset>) => {
    return (
      <>
        <Typography variant="body2">Clicking opens this experiment on ENCODE <OpenInNew fontSize="inherit" /></Typography>
        <br />
        <Typography variant="body2"><b>Accession:</b> {bar.metadata.accession}</Typography>
        <Typography variant="body2"><b>Sample:</b> {capitalizeFirstLetter(bar.metadata.biosample)}</Typography>
        <Typography variant="body2"><b>Tissue:</b> {capitalizeFirstLetter(bar.metadata.tissue)}</Typography>
        <Typography variant="body2"><b>Biosample Type:</b> {capitalizeFirstLetter(bar.metadata.biosample_type)}</Typography>
        {scale === "linearTPM" ?
          <Typography variant="body2"><b>TPM:</b> {bar.value.toFixed(2)}</Typography>
          :
          <Typography variant="body2"><b>Log<sub>10</sub>(TPM + 1):</b> {bar.value.toFixed(2)}</Typography>
        }
      </>
    )
  }, [scale])

  const handleSetTissues: MultiSelectOnChange = (_, value) => {
    setTissues(value)
  }

  const handleSetBiosamples: MultiSelectOnChange = (_, value) => {
    setBiosamples(value)
  }

  const handleSetGene = (newGene: string) => {
    setGene(newGene)
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent={"space-between"}>
        <Typography
          alignSelf={"flex-end"}
          variant={props.applet ? "h4" : "h5"}>
          Gene Expression Profiles by RNA-seq
        </Typography>
        <Stack direction="row" spacing={3}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
            onClick={handleOpenConfigGB}
          >
            <Image style={{ objectFit: "contain" }} src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" fill alt="ucsc-button" />
          </Button>
          <Button
            variant="contained"
            href={gene ? "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + gene : undefined}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
          >
            <Image style={{ objectFit: "contain" }} src="https://geneanalytics.genecards.org/media/81632/gc.png" fill alt="gene-card-button" />
          </Button>
        </Stack>
      </Stack>
      {props.applet ?
        <Stack direction="row" gap={2} flexWrap={"wrap"}>
          <Select
            value={assembly}
            variant="outlined"
            onChange={(event) => {
              handleSetAssembly(event.target.value as Assembly)
              handleSetGene(null) //clear gene since it's no longer valid with selected assembly
            }}
          >
            <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
            <MenuItem value={"mm10"}>mm10</MenuItem>
          </Select>
          <GeneAutocomplete
            key={assembly} //force reset of component state when assembly changes. Without this, the value of the component is old gene when toggling to ortholog
            assembly={assembly}
            slotProps={{
              autocompleteProps: {
                fullWidth: true,
                size: "medium",
                sx: { minWidth: '200px' },
                defaultValue: {
                  name: gene, //only gene needed to set default
                  id: "",
                  coordinates: {
                    chromosome: "",
                    start: 0,
                    end: 0
                  }
                }
              }
            }}
            endIcon="none"
            colorTheme={"light"}
            onGeneSelected={(gene: GeneInfo) => {
              handleSetGene(gene ? gene.name : null)
              router.push(`${pathname}?assembly=${assembly}&gene=${gene ? gene.name : ''}`)
            }}
            onGeneSubmitted={(gene: GeneInfo) => {
              handleSetGene(gene ? gene.name : null)
              router.push(`${pathname}?assembly=${assembly}&gene=${gene ? gene.name : ''}`)
            }}
          />
          <LoadingButton
            sx={{ textTransform: 'none' }}
            loading={loadingOrtholog}
            disabled={!dataOrtholog || !!errorOrtholog || dataOrtholog?.geneOrthologQuery?.length === 0}
            variant="outlined"
            endIcon={<SyncAlt />}
            onClick={() => {
              const newGene = dataOrtholog.geneOrthologQuery[0][assembly === "GRCh38" ? 'mouseGene' : 'humanGene']
              const newAssembly = assembly === "GRCh38" ? "mm10" : "GRCh38"
              handleSetGene(newGene)
              handleSetAssembly(newAssembly)
              router.push(`${pathname}?assembly=${newAssembly}&gene=${newGene}`)
            }}
          >
            {dataOrtholog?.geneOrthologQuery.length > 0 ?
              <>
              {`Go to ${assembly === "GRCh38" ? "mm10" : "GRCh38"} ortholog:`}&thinsp;<i>{dataOrtholog?.geneOrthologQuery[0][assembly === "GRCh38" ? 'mouseGene' : 'humanGene']}</i>
              </>
              :
              `No ortholog found in ${assembly === "GRCh38" ? "mm10" : "GRCh38"}`
            }
          </LoadingButton>
        </Stack>
        :
        <Grid>
          <InputLabel>Gene</InputLabel>
          <Select
            value={gene}
            size="small"
            MenuProps={{ sx: { maxHeight: '600px' } }}
          >
            {props.genes.map((gene) => {
              return (
                <MenuItem
                  key={gene.name}
                  sx={{ display: "block" }}
                  value={gene.name}
                  onClick={() => handleSetGene(gene.name)}
                >
                  <Typography><i>{gene.name}</i></Typography>
                  {gene?.linkedBy && <Typography variant="body2" color={"text.secondary"}>Linked By: {gene.linkedBy.join(', ')}</Typography>}
                </MenuItem>
              )
            })}
          </Select>
        </Grid>
      }
      {/* Plot controls/filters */}
      <Stack direction="row" gap={2} flexWrap={"wrap"}>
       <FormControl>
          <FormLabel>RNA-seq Type</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={RNAtype}
            exclusive
            onChange={handleRNATypeChange}
            aria-label="RNA-seq Type"
            size="small"
          >
            {/* Human only has total RNA-seq, so disable other options when in human */}
            <ToggleButton sx={{ textTransform: "none" }} value="total RNA-seq">Total</ToggleButton>
            <Tooltip title={assembly === "GRCh38" && "Only available in mm10"}>
              <div> {/** div needed to show tooltip when button disabled */}
                <ToggleButton disabled={assembly === "GRCh38"} sx={{ textTransform: "none" }} value="polyA plus RNA-seq">PolyA+</ToggleButton>
              </div>
            </Tooltip>
            <Tooltip title={assembly === "GRCh38" && "Only available in mm10"}>
              <div>
                <ToggleButton disabled={assembly === "GRCh38"} sx={{ textTransform: "none" }} value="all">All</ToggleButton>
              </div>
            </Tooltip>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Scale</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={scale}
            exclusive
            onChange={handleScaleChange}
            aria-label="Scale"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="linearTPM">Linear TPM</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="logTPM">Log<sub>10</sub>(TPM + 1)</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>View By</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={viewBy}
            exclusive
            onChange={handleGroupChange}
            aria-label="View By"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="byExperimentTPM">Experiment</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="byTissueTPM">Tissue</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="byTissueMaxTPM">Tissue Max</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Replicates</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={replicates}
            exclusive
            onChange={handleReplicatesChange}
            aria-label="Scale"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="mean">Average</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="all">Show Replicates</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>{biosamples.length === biosampleTypes.length ? "Biosample Types" : <i>Biosample Types*</i>}</FormLabel>
          <MultiSelect
            options={biosampleTypes}
            onChange={handleSetBiosamples}
            placeholder="Filter Biosamples"
            limitTags={2}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{tissues.length === initialTissues(assembly).length ? "Tissues" : <i>Tissues*</i>}</FormLabel>
          <MultiSelect
            options={assembly === "GRCh38" ? humanTissues : mouseTissues}
            onChange={handleSetTissues}
            placeholder="Filter Tissues"
            limitTags={2}
          />
        </FormControl>
      </Stack>
      <Divider />
      <Stack direction={"row"} gap={2} flexWrap={"wrap"}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel size='small' style={{ zIndex: 0 }}>Search Samples</InputLabel>
          <OutlinedInput
            size='small'
            endAdornment={search ? <IconButton onClick={() => setSearch("")}><Close /></IconButton> : <Search />}
            label="Search Samples"
            placeholder="ID, Tissue, Biosample"
            value={search}
            onChange={handleSetSearch} />
        </FormControl>
        <Tooltip title="Select from SVG (plot), PNG (plot), or TSV (data)">
          <Button disabled={!gene} variant="outlined" endIcon={<Download />} sx={{ textTransform: 'none', height: 40, flexShrink: 0 }} onClick={() => setDownloadOpen(true)}>
            Download
          </Button>
        </Tooltip>
      </Stack>
      {
        loadingGeneID || loadingExperiments ?
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12
            }}>
            <LoadingMessage />
          </Grid>
          :
          dataExperiments ?
            <Grid size={12}>
              <VerticalBarPlot
                data={plotData}
                topAxisLabel={(gene + " Gene Expression in " + assembly + ' - ') + (scale === "linearTPM" ? "Linear TPM" : "Log10(TPM + 1)")}
                SVGref={plotRef}
                onBarClicked={(x) => window.open("https://www.encodeproject.org/experiments/" + x.metadata.accession, "_blank", "noopener,noreferrer")}
                TooltipContents={(bar) => <PlotTooltip {...bar} />}
              />
            </Grid>
            :
            <Typography variant="h5">
              Please Select a Gene
            </Typography>
      }
      {/* Configure Trackhub */}
      <ConfigureGBModal
        coordinates={{
          assembly: assembly,
          chromosome: dataGeneID?.gene[0]?.coordinates.chromosome,
          start: dataGeneID?.gene[0]?.coordinates.start,
          end: dataGeneID?.gene[0]?.coordinates.end,
        }}
        accession={gene} //This is hacky, need to change configGBModal to change this prop -Jonathan 7/25/24
        open={configGBopen}
        setOpen={setConfigGBOpen}
      />
      {/* Download Dialog */}
      <DownloadDialog
        open={downloadOpen}
        fileFormats={['svg', 'png', 'tsv']}
        defaultSelected={['svg', 'png', 'tsv']}
        onClose={() => setDownloadOpen(false)}
        onSubmit={handleDownload}
      />
    </Stack>
  );
}
